import { AssetAmount } from "@sundaeswap/asset";
import { Utils } from "../Utils.class";
import { ADA_ASSET_ID } from "../../lib/constants";
import { PREVIEW_DATA } from "../../testing/mockData";

describe("Utils class", () => {
  it("getMinReceivableFromSlippage", () => {
    const resultA = Utils.getMinReceivableFromSlippage(
      PREVIEW_DATA.pool,
      PREVIEW_DATA.assets.tada,
      0.1
    );

    expect(resultA).toBeInstanceOf(AssetAmount);
    expect(resultA).toMatchObject(
      expect.objectContaining({
        amount: 8570604n,
        decimals: 0,
      })
    );

    const resultB = Utils.getMinReceivableFromSlippage(
      PREVIEW_DATA.pool,
      PREVIEW_DATA.assets.tindy,
      0.01
    );

    expect(resultB).toBeInstanceOf(AssetAmount);
    expect(resultB).toMatchObject(
      expect.objectContaining({
        amount: 36326909n,
        decimals: 6,
      })
    );

    try {
      Utils.getMinReceivableFromSlippage(
        PREVIEW_DATA.pool,
        {
          assetId: "not in the pool",
          amount: new AssetAmount(10n),
        },
        0.1
      );
    } catch (e) {
      expect((e as Error).message).toStrictEqual(
        `The supplied asset ID does not match either assets within the supplied pool data. {"suppliedAssetID":"not in the pool","poolAssetIDs":["","fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459"]}`
      );
    }

    /**
     * We set a high spread between ratios to ensure that a very low bid
     * will result in at least a single token from the opposing side, especially
     * if it's a 0 decimal place asset.
     */
    const mockPoolData = {
      ...PREVIEW_DATA.pool,
      quantityA: "10000000000",
      quantityB: "209",
      assetB: {
        ...PREVIEW_DATA.pool.assetB,
        decimals: 0,
      },
    };

    const mockSuppliedAsset = {
      assetId: PREVIEW_DATA.assets.tada.assetId,
      amount: new AssetAmount(80000000n, 6),
    };

    // Default 3% slippage.
    expect(
      Utils.getMinReceivableFromSlippage(mockPoolData, mockSuppliedAsset, 0.3)
    ).toMatchObject(
      expect.objectContaining({
        amount: 1n,
        decimals: 0,
      })
    );

    // Even a 99% slippage should be at least a single token.
    expect(
      Utils.getMinReceivableFromSlippage(mockPoolData, mockSuppliedAsset, 0.99)
    ).toMatchObject(
      expect.objectContaining({
        amount: 1n,
        decimals: 0,
      })
    );

    // Only a 100% slippage will be okay with 0 assets received.
    expect(
      Utils.getMinReceivableFromSlippage(mockPoolData, mockSuppliedAsset, 1)
    ).toMatchObject(
      expect.objectContaining({
        amount: 0n,
        decimals: 0,
      })
    );
  });

  it("should accurately accumulate suppliedAssets", () => {
    const aggregate = Utils.accumulateSuppliedAssets(
      [
        PREVIEW_DATA.assets.tada,
        {
          assetId: ADA_ASSET_ID,
          amount: new AssetAmount(25000000n, 6),
        },
        PREVIEW_DATA.assets.tindy,
      ],
      "preview"
    );

    const { SCOOPER_FEE, RIDER_FEE } = Utils.getParams("preview");

    expect(aggregate).toMatchObject({
      lovelace: 45000000n + SCOOPER_FEE + RIDER_FEE,
      fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a35153518374494e4459:
        20000000n,
    });
  });

  it("should accurately sort a pair of assets", () => {
    const result = Utils.sortSwapAssets([
      PREVIEW_DATA.assets.tindy,
      PREVIEW_DATA.assets.tada,
    ]);
    expect(result[0]).toMatchObject({
      assetId: PREVIEW_DATA.assets.tada.assetId,
      amount: expect.objectContaining({
        amount: PREVIEW_DATA.assets.tada.amount.amount,
        decimals: PREVIEW_DATA.assets.tada.amount.decimals,
      }),
    });
    expect(result[1]).toMatchObject({
      assetId: PREVIEW_DATA.assets.tindy.assetId,
      amount: expect.objectContaining({
        amount: PREVIEW_DATA.assets.tindy.amount.amount,
        decimals: PREVIEW_DATA.assets.tindy.amount.decimals,
      }),
    });

    const result2 = Utils.sortSwapAssets([
      PREVIEW_DATA.assets.tindy,
      {
        ...PREVIEW_DATA.assets.tindy,
        assetId: "abcd",
      },
    ]);
    expect(result2[0]).toMatchObject({
      assetId: "abcd",
      amount: expect.objectContaining({
        amount: PREVIEW_DATA.assets.tindy.amount.amount,
        decimals: PREVIEW_DATA.assets.tindy.amount.decimals,
      }),
    });
    expect(result2[1]).toMatchObject(PREVIEW_DATA.assets.tindy);
  });

  it("should accurately get the swap direction", () => {
    const result = Utils.getAssetSwapDirection(
      { assetId: "", amount: new AssetAmount(10n) },
      [PREVIEW_DATA.pool.assetA, PREVIEW_DATA.pool.assetB]
    );
    expect(result).toStrictEqual(0);

    const result2 = Utils.getAssetSwapDirection(PREVIEW_DATA.assets.tindy, [
      PREVIEW_DATA.pool.assetA,
      PREVIEW_DATA.pool.assetB,
    ]);
    expect(result2).toStrictEqual(1);
  });

  it("should convert a long string to a chunked array correctly", () => {
    const str =
      "d8799f4102d8799fd8799fd8799fd8799f581c8692a239eeae24067fb6ead1d4f636ae47fa2b5494884261dd768c4cffd8799fd8799fd8799f581c0d33957c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd87a80ff1a002625a0d87b9fd87a9fd8799f1a004c4b401a002fa0ebffffffff";
    const result = Utils.splitMetadataString(str);
    expect(result).toStrictEqual([
      "d8799f4102d8799fd8799fd8799fd8799f581c8692a239eeae24067fb6ead1d4",
      "f636ae47fa2b5494884261dd768c4cffd8799fd8799fd8799f581c0d33957c07",
      "acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a80ffd8",
      "7a80ff1a002625a0d87b9fd87a9fd8799f1a004c4b401a002fa0ebffffffff",
    ]);
    expect(result[0].length).toStrictEqual(64);
    expect(result[1].length).toStrictEqual(64);
    expect(result[2].length).toStrictEqual(64);
    expect(result[3].length).toStrictEqual(62);

    const result2 = Utils.splitMetadataString(str, "0x");
    expect(result2).toStrictEqual([
      "0xd8799f4102d8799fd8799fd8799fd8799f581c8692a239eeae24067fb6ead1",
      "0xd4f636ae47fa2b5494884261dd768c4cffd8799fd8799fd8799f581c0d3395",
      "0x7c07acdddecc9882457da22f05e0d189f7fc95b1972e6d5105ffffffffd87a",
      "0x80ffd87a80ff1a002625a0d87b9fd87a9fd8799f1a004c4b401a002fa0ebff",
      "0xffffff",
    ]);
    expect(result2[0].length).toStrictEqual(64);
    expect(result2[1].length).toStrictEqual(64);
    expect(result2[2].length).toStrictEqual(64);
    expect(result2[3].length).toStrictEqual(64);
    expect(result2[4].length).toStrictEqual(8);
  });
});

import { PREVIEW_DATA } from "../../../testing/mockData";
import { IAsset } from "../../../@types";
import { AssetAmount } from "@sundaeswap/asset";
import { SwapConfig } from "../SwapConfig.class";

let config: SwapConfig;
beforeEach(() => {
  config = new SwapConfig();
});

describe("SwapConfig class", () => {
  it("should construct with no parameters", () => {
    expect(config).toBeInstanceOf(SwapConfig);
  });

  it("should construct with a config", () => {
    const myConfig = new SwapConfig({
      minReceivable: new AssetAmount(10n),
      pool: PREVIEW_DATA.pool,
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.address,
        },
      },
      suppliedAsset: PREVIEW_DATA.assets.tada,
    });

    expect(myConfig.buildArgs()).toMatchObject({
      pool: PREVIEW_DATA.pool,
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.address,
        },
      },
      suppliedAsset: {
        assetId: PREVIEW_DATA.assets.tada.assetId,
        amount: expect.objectContaining({
          amount: PREVIEW_DATA.assets.tada.amount.amount,
          decimals: PREVIEW_DATA.assets.tada.amount.decimals,
        }),
      },
      // 10% minus the pool fee
      minReceivable: expect.objectContaining({
        amount: 8570604n,
        decimals: 0,
      }),
    });
  });

  it("it should set the pool correctly", () => {
    config.setPool(PREVIEW_DATA.pool);
    expect(config.pool).toMatchObject(PREVIEW_DATA.pool);
  });

  it("should set the suppliedAsset correctly", () => {
    const asset: IAsset = {
      amount: new AssetAmount(20n, 6),
      assetId: "",
    };

    config.setSuppliedAsset(asset);
    expect(config.suppliedAsset).toMatchObject({
      amount: expect.objectContaining({
        amount: 20n,
        decimals: 6,
      }),
      assetId: "",
    });
  });

  it("should set the orderAddresses correctly", () => {
    config.setOrderAddresses({
      DestinationAddress: {
        address: PREVIEW_DATA.address,
      },
    });
    expect(config.orderAddresses).toMatchObject({
      DestinationAddress: {
        address: PREVIEW_DATA.address,
      },
    });
  });

  it("should throw when providing invalid assetIDs to setSuppliedAsset()", () => {
    config
      .setOrderAddresses({
        DestinationAddress: {
          address: PREVIEW_DATA.address,
        },
      })
      .setMinReceivable(new AssetAmount(20n))
      .setPool(PREVIEW_DATA.pool)
      .setSuppliedAsset({
        amount: new AssetAmount(20n, 6),
        assetId: "tINDY",
      });

    try {
      config.buildArgs();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toStrictEqual(
        "You haven't defined the OrderAddresses in your Config. Set with .setOrderAddresses()"
      );
    }

    config
      .setOrderAddresses({
        DestinationAddress: {
          address: PREVIEW_DATA.address,
        },
      })
      .setMinReceivable(new AssetAmount(20n))
      .setPool(PREVIEW_DATA.pool)
      .setSuppliedAsset({
        amount: new AssetAmount(20n, 6),
        assetId:
          "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a35153518374494e4459",
      });

    try {
      config.buildArgs();
    } catch (e) {
      expect(e).toBeInstanceOf(Error);
      expect((e as Error).message).toStrictEqual(
        "Invalid assetId: fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a35153518374494e4459. You likely forgot to concatenate with a period, like so: fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459"
      );
    }
  });

  it("should run buildArgs() without errors", () => {
    const validFunding: IAsset = {
      amount: new AssetAmount(2n, 6),
      assetId: "",
    };

    config
      .setPool(PREVIEW_DATA.pool)
      .setMinReceivable(new AssetAmount(20n))
      .setOrderAddresses({
        DestinationAddress: {
          address: PREVIEW_DATA.address,
        },
      })
      .setSuppliedAsset(validFunding);

    expect(config.buildArgs()).toMatchObject({
      pool: PREVIEW_DATA.pool,
      orderAddresses: {
        DestinationAddress: {
          address: PREVIEW_DATA.address,
        },
      },
      minReceivable: expect.objectContaining({
        amount: 20n,
        decimals: 0,
      }),
      suppliedAsset: {
        assetId: validFunding.assetId,
        amount: expect.objectContaining({
          amount: validFunding.amount.amount,
          decimals: validFunding.amount.decimals,
        }),
      },
    });
  });

  it("should validate correctly when no suppliedAsset is set", () => {
    config.setPool(PREVIEW_DATA.pool).setOrderAddresses({
      DestinationAddress: {
        address: PREVIEW_DATA.address,
      },
    });

    try {
      config.validate();
    } catch (e) {
      expect((e as Error).message).toStrictEqual(
        "You haven't funded this swap on your SwapConfig! Fund the swap with .setSuppliedAsset()"
      );
    }
  });

  it("should validate correctly when no minReceivable is set", () => {
    config
      .setOrderAddresses({
        DestinationAddress: {
          address: PREVIEW_DATA.address,
        },
      })
      .setPool(PREVIEW_DATA.pool)
      .setSuppliedAsset(PREVIEW_DATA.assets.tindy);

    try {
      config.validate();
    } catch (e) {
      expect((e as Error).message).toStrictEqual(
        "You haven't set a minimum receivable amount on your SwapConfig!"
      );
    }
  });
});

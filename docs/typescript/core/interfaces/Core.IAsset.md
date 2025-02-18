# Interface: IAsset

[Core](../modules/Core.md).IAsset

Basic asset structure with the amount.

## Properties

### amount

• **amount**: `AssetAmount`<`any`\>

An instance of the asset amount including the decimal place.

#### Defined in

[@types/utilities.ts:57](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L57)

___

### assetId

• **assetId**: `string`

The hex encoded asset string, separating the Policy ID from the Asset Name with a period.

**`Example`**

```ts
POLICY_ID.ASSET_NAME
```

#### Defined in

[@types/utilities.ts:55](https://github.com/SundaeSwap-finance/sundae-sdk/blob/main/packages/core/src/@types/utilities.ts#L55)

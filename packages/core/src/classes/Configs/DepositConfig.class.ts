import {
  DepositConfigArgs,
  IAsset,
  IPoolData,
  OrderAddresses,
} from "../../@types";
import { OrderConfig } from "../Abstracts/OrderConfig.abstract.class";

/**
 * The main config class for building valid arguments for a Deposit.
 */
export class DepositConfig extends OrderConfig<DepositConfigArgs> {
  suppliedAssets?: [IAsset, IAsset];

  constructor(args?: DepositConfigArgs) {
    super();

    args && this.setFromObject(args);
  }

  setSuppliedAssets(assets: [IAsset, IAsset]) {
    this.suppliedAssets = assets;
    return this;
  }

  buildArgs(): DepositConfigArgs {
    this.validate();

    return {
      orderAddresses: this.orderAddresses as OrderAddresses,
      pool: this.pool as IPoolData,
      suppliedAssets: this.suppliedAssets as [IAsset, IAsset],
    };
  }

  setFromObject({
    orderAddresses,
    pool,
    suppliedAssets,
  }: DepositConfigArgs): void {
    this.setOrderAddresses(orderAddresses);
    this.setPool(pool);
    this.setSuppliedAssets(suppliedAssets);
  }

  validate(): never | void {
    super.validate();

    if (!this.suppliedAssets) {
      throw new Error(
        "You did not provided funding for this deposit! Make sure you supply both sides of the pool with .setSuppliedAssets()"
      );
    }
  }
}

import { IPoolQuery, ITxBuilderFees } from "@sundaeswap/sdk-core";
import { Dispatch, FC, SetStateAction, useState } from "react";
import ReactJson from "react-json-view";
import { useAppState } from "../../state/context";
import { Deposit } from "./modules/Deposit";
import { SwapAB } from "./modules/SwapAB";
import { SwapBA } from "./modules/SwapBA";
import { Withdraw } from "./modules/Withdraw";
import { Zap } from "./modules/Zap";
import { Lock } from "./modules/LockAssets";
import { Unlock } from "./modules/UnlockAssets";

export const poolQuery: IPoolQuery = {
  pair: [
    "",
    "fa3eff2047fdf9293c5feef4dc85ce58097ea1c6da4845a351535183.74494e4459",
  ],
  fee: "0.30",
};

interface CBOR {
  cbor: string;
  hash?: string;
}

export interface ActionArgs {
  submit?: boolean;
  setCBOR: Dispatch<SetStateAction<CBOR>>;
  setFees: Dispatch<SetStateAction<ITxBuilderFees | undefined>>;
}

export const Actions: FC = () => {
  const { SDK } = useAppState();
  const [cbor, setCBOR] = useState<CBOR>({
    cbor: "",
  });
  const [fees, setFees] = useState<ITxBuilderFees>();
  const [submit, setSubmit] = useState(false);

  if (!SDK) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="mb-4 text-lg font-bold text-white flex items-center justify-between">
        SundaeSwap Protocol Actions
        <div className="flex items-center justify-center gap-2">
          <label htmlFor="submitTx">Submit to Wallet?</label>
          <input
            id="submitTx"
            type="checkbox"
            checked={submit}
            onChange={(e) => setSubmit(e.target.checked)}
          />
        </div>
      </h2>
      <div className="grid grid-cols-2 gap-4">
        <SwapAB setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <SwapBA setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <Deposit setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <Withdraw setFees={setFees} setCBOR={setCBOR} submit={submit} />
        {/* <button onClick={tempCancelOrder}>Cancel Order</button> */}
        <Zap setCBOR={setCBOR} setFees={setFees} submit={submit} />
        {/* <UpdateSwap setCBOR={setCBOR} setFees={setFees} submit={submit} /> */}
        <Lock setFees={setFees} setCBOR={setCBOR} submit={submit} />
        <Unlock setFees={setFees} setCBOR={setCBOR} submit={submit} />
      </div>
      {cbor.hash && (
        <>
          <h2 className="mb-4 text-lg font-bold text-white">Tx Hash</h2>
          <div className="p-8 rounded-lg bg-gray-800 border-gray-700 whitespace-pre-wrap break-all">
            {cbor.hash}
          </div>
        </>
      )}
      <h2 className="mb-4 text-lg font-bold text-white">CBOR</h2>
      <div className="p-8 rounded-lg bg-gray-800 border-gray-700 whitespace-pre-wrap break-all">
        {cbor.cbor}
      </div>
      <h2 className="mb-4 text-lg font-bold text-white">Fees</h2>
      <div className="p-8 rounded-lg bg-gray-800 border-gray-700 whitespace-pre-wrap break-all">
        {fees && (
          <ReactJson
            theme="embers"
            enableClipboard={false}
            style={{
              padding: 8,
              borderRadius: 8,
              border: "1px solid #555",
            }}
            src={{
              cardanoTxFee: fees.cardanoTxFee.amount.toString(),
              scooperFee: fees.scooperFee.amount.toString(),
              deposit: fees.deposit.amount.toString(),
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Actions;

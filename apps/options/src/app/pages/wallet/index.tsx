import { useState } from 'react';
import Topup from './Topup';
import Withdraw from './Withdraw';

const Wallet = (): JSX.Element => {
    const [tabNo, setTabNo] = useState<number>(0);
    const handleTabChange = (index: number) => {
        setTabNo(index)
    }
    return (
        <div className='w-full flex items-center justify-center sm:p-[30px] p-[10px]'>
            <div className="funds-wrapper rounded-[20px] border-2 border-[#333333] sm:w-[480px]">
                <div className="border-b-2 py-3 px-[30px] border-brandColor/20 mb-30 flex relative">
                    {['Deposit', 'Withdraw'].map((tab: string, index) => (
                        <button
                            key={index}
                            className={`px-15 py-15 transition-all hover:bg-bunker/20 rounded-t-xl flex-1 ${index === tabNo ? "text-btnBlackTxtColor" : "text-grayTxtColor"
                                }`}
                            onClick={() => handleTabChange(index)}
                        >
                            {tab}
                        </button>
                    ))}
                    <div
                        className={`flex-1 h-[2px] bg-brandColor absolute bottom-[-2px] w-1/2 ${tabNo === 0 ? "left-0" : "left-1/2"
                            } transition-all`}
                    ></div>
                </div>
                <div className="w-full px-[10px] py-[20px]">
                    {
                        tabNo === 0 ? (
                            <Topup />
                        ) : (
                            <Withdraw />
                        )
                    }
                </div>
            </div>
        </div>
    )
}

export default Wallet
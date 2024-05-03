import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import SvgIcon from "@mui/material/SvgIcon";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import WatchLaterOutlinedIcon from "@mui/icons-material/WatchLaterOutlined";
import Check from "@mui/icons-material/Check";
import CheckBoxOutlineBlank from "@mui/icons-material/CheckBoxOutlineBlank";
import useLocalstorage from "../../hooks/useLocalstorage";
import { useAccount } from "../../hooks/useAccount";
import { useCallback, useState } from "react";
import bgImage from "../../../assets/images/select-web3-bg.png";

export default function SelectWeb3ModePopup(props: {
    open: boolean;
    onClose: (isOpen: boolean) => void;
}) {
    const { open, onClose } =
        props;

    const handleClose = () => {
        onClose(false);
    };

    const [checked, setChecked] = useState<boolean>(false);

    const { isWalletModeSetted, updateWalletModeSetted, updateWeb3Mode } = useLocalstorage();
    const { connect_eoa, connect_sca } = useAccount();

    const handleConnect = useCallback((mode: 'SCA' | 'EOA') => {
        if (checked) {
            updateWalletModeSetted(true);
        }

        handleClose();
        if (mode === 'SCA') {
            connect_sca();
        } else {
            connect_eoa();
        }
        updateWeb3Mode(mode);
        
    }, [connect_sca, connect_eoa, checked])

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
            sx={{
                "& .MuiDialog-paperScrollPaper": {
                    width: "420px",
                    borderRadius: "30px",
                    margin: "20px",
                },
            }}
            PaperProps={{
                className: "bg-modalBgColor border-2 border-modalStrokeColor",
            }}
        >
            <div
                id="alert-dialog-title"
                className="w-full flex justify-between items-center"
                style={{
                    background: bgImage,
                    height: 120,
                    width: '100%'
                }}
            >
                <img src={bgImage} alt="" className="w-full h-full" />
                <SvgIcon
                    component={CloseIcon}
                    className="w-[36px] h-[36px] text-grayTxtColor p-5 rounded-full bg-btnBlackStrokeColor absolute right-[20px] top-[10px]"
                    onClick={handleClose}
                />
            </div>
            <DialogContent className="px-10 sm:px-20">
                <div className="rounded-xl py-[8px] sm:py-15 w-full flex justify-center flex-col text-center">
                    <h3 className="text-[18px] md:text-[24px]">Introducing Gasless Trading</h3>
                    <p
                        id="alert-dialog-description"
                        className="text-btnBlackTxtColor p-10 sm:p-20 text-center text-14 pb-5 sm:pb-10"
                    >
                        You can now enjoy a gasless trading experience. Simply deposit funds from your wallet to enable your smart contract account.
                    </p>
                </div>

                <button className="h-[40px] md:h-[60px] px-30 bg-brandColor rounded-xl md:rounded-2xl text-14px md:text-18 text-btnTxtColor w-full mt-5" onClick={() => handleConnect('SCA')}>Enable</button>
                <button className="bg-transparent h-[40px] md:h-[60px] px-30 text-14px md:text-18 mt-5 w-full" onClick={() => handleConnect('EOA')}>No, thanks</button>

                <div className="w-full flex justify-center">
                    <FormControlLabel
                        label="Don't show this message again"
                        control={
                            <Checkbox
                                checked={checked}
                                icon={
                                    <CheckBoxOutlineBlank className="bg-btnBlackBgColor text-grayTxtColor rounded" />
                                }
                                checkedIcon={
                                    <Check className="bg-btnBlackBgColor text-brandColor rounded" />
                                }
                                onChange={() => setChecked(!checked)}
                                size="small"
                            />
                        }
                        className="text-btnBlackTxtColor text-14"
                        sx={{ ".MuiFormControlLabel-label": { fontSize: "14px" } }}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
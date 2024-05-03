import { useCallback, useEffect, useState } from "react";

export default function useLocalstorage() {
    const [web3Mode, setWeb3Mode] = useState<'SCA' | 'EOA'>('EOA');
    const [isWalletModeSetted, setWalletModeSetted] = useState<boolean>(false);

    useEffect(() => {
        const _isWalletModeSetted = localStorage.getItem('WALLET_MODE_SETTED') === 'true';
        // setWalletModeSetted(_isWalletModeSetted);
        setWalletModeSetted(true);
    }, [])

    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         const mode = (localStorage.getItem('WEB3_MODE') || 'EOA') as ('SCA' | 'EOA');
    //         setWeb3Mode(mode);
    //     }, 1000)

    //     return () => {
    //         clearInterval(interval)
    //     }
    // }, []);

    const updateWeb3Mode = useCallback((mode: 'SCA' | 'EOA') => {
        localStorage.setItem('WEB3_MODE', mode);
        setWeb3Mode(mode);
    }, [])

    const updateWalletModeSetted = useCallback((value: boolean) => {
        localStorage.setItem('WALLET_MODE_SETTED', `${value}`);
        setWalletModeSetted(value);
    }, [])

    return { web3Mode, updateWeb3Mode, isWalletModeSetted, updateWalletModeSetted };
}
// HeaderPay component (headerpay.js)
import './style.css';
import { useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const HeaderPay = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const selectedBank = params.get('bank');

    const [stepCompleted, setStepCompleted] = useState(1);

    useEffect(() => {
        const currentPath = location.pathname;
        if (currentPath === '/payment/:id') {
            setStepCompleted(1);
        } else if (currentPath === '/transfer') {
            setStepCompleted(2);
        } else if (currentPath === '/eticket') {
            setStepCompleted(3);
        }
    }, [location.pathname]);

    let paymentText = 'Pembayaran';
    if (selectedBank) {
        paymentText = `${selectedBank}`;
    }

    return (
        <div className="header-payment">
            <div className='header-payment-wrapper'>
                <div className='d-flex align-items-center'>
                    <p className='bi bi-arrow-left fs-3'></p>
                    <p className='ms-3 fs-5 fw-bold'>{paymentText}</p>
                </div>
                <div className='d-flex gap-2'>
                    <div className='d-flex gap-2 align-items-center'>
                        <p className={`number-header-pay ${stepCompleted >= 1 ? 'bg-header-pay' : ''}`}>{stepCompleted >= 1 ? '✔' : '1'}</p>
                        <p className='order-header-pay'>Pilih Metode</p>
                        <div className='line-header'></div>
                    </div>
                    <div className='d-flex gap-2 align-items-center'>
                        <p className={`number-header-pay ${stepCompleted >= 2 ? 'bg-header-pay' : ''}`}>{stepCompleted >= 2 ? '✔' : '2'}</p>
                        <p className='order-header-pay'>Bayar</p>
                        <div className='line-header'></div>
                    </div>
                    <div className='d-flex gap-2 align-items-center'>
                        <p className={`number-header-pay ${stepCompleted >= 3 ? 'bg-header-pay' : ''}`}>{stepCompleted >= 3 ? '✔' : '3'}</p>
                        <p className='order-header-pay'>Tiket</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default HeaderPay;

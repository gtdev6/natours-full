/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe(
    'pk_test_51OmQ1WSGoSlDVNhL4Qg8TJDyjb0CjIIz72APg9prX6ucqFwJ0WxN6cOQhR0TLjRCZsqhETrJhBRFXcVOjhovvFsu00UaYgpzL8',
);

export const bookTour = async (tourId) => {
    try {
        // 1) Get checkout session from API
        const session = await axios(
            `/api/v1/bookings/checkout-session/${tourId}`,
        );

        // 2) Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id,
        });
    } catch (err) {
        console.log(err);
        showAlert('error', err);
    }
};

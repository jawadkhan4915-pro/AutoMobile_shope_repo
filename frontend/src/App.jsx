import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { StoreProvider } from './store/useStore';
import { router } from './routes';

function App() {
    return (
        <AuthProvider>
            <StoreProvider>
                <CartProvider>
                    <RouterProvider router={router} />
                </CartProvider>
            </StoreProvider>
        </AuthProvider>
    );
}

export default App;

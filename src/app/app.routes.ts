import { Routes } from '@angular/router';
import { ProductsComponent } from './components/products/products.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { CartComponent } from './components/cart/cart.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: ProductsComponent, title: 'Dashboard - VegeFood' },
  { path: 'register', component: RegisterComponent, title: 'Register - VegeFood' },
  { path: 'login', component: LoginComponent, title: 'Login - VegeFood' },
  { 
    path: 'cart', 
    component: CartComponent, 
    canActivate: [authGuard],
    title: 'Shopping Cart - VegeFood' 
  },
  { 
    path: 'checkout', 
    component: CheckoutComponent, 
    canActivate: [authGuard],
    title: 'Checkout - VegeFood' 
  },
  { path: '**', component: NotFoundComponent, title: '404 - Page Not Found' }
];

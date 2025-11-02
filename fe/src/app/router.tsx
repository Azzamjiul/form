import { BrowserRouter, Route, Routes } from "react-router"
import { CustomersPage } from "./pages/CustomersPage"
import { DashboardPage } from "./pages/DashboardPage"
import { HomePage } from "./pages/HomePage"
import { LoginPage } from "./pages/LoginPage"
import { OrdersPage } from "./pages/OrdersPage"
import { ProductsPage } from "./pages/ProductsPage"
import { RegisterPage } from "./pages/RegisterPage"
import { SettingsPage } from "./pages/SettingsPage"
import FormsPage from "./pages/FormsPage"
import FormDetailPage from "./pages/FormDetailPage"
import QuizTakingPage from "./pages/QuizTakingPage"

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/customers" element={<CustomersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/forms" element={<FormsPage />} />
        <Route path="/forms/:formId" element={<FormDetailPage />} />
        <Route path="/quiz/:accessToken" element={<QuizTakingPage />} />
      </Routes>
    </BrowserRouter>
  )
}
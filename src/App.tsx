import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { TerezaProvider } from '@/context/TerezaContext'
import Layout from '@/components/Layout'
import Dashboard from '@/pages/Index'
import Doses from '@/pages/Doses'
import Medidas from '@/pages/Medidas'
import Nutricao from '@/pages/Nutricao'
import Diario from '@/pages/Diario'
import Perfil from '@/pages/Perfil'
import NotFound from '@/pages/NotFound'

const App = () => (
  <BrowserRouter>
    <TerezaProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/doses" element={<Doses />} />
            <Route path="/medidas" element={<Medidas />} />
            <Route path="/nutricao" element={<Nutricao />} />
            <Route path="/diario" element={<Diario />} />
            <Route path="/perfil" element={<Perfil />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </TerezaProvider>
  </BrowserRouter>
)

export default App

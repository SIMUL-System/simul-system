import { NavLink, Outlet } from 'react-router-dom'

import Icone from '../components/Icone'

import '../App.css'
import '../styles/admin.css'

const SECOES = [
  { para: '/admin', rotulo: 'Visão geral', icone: 'grade', fim: true },
  { para: '/admin/rotas', rotulo: 'Rotas', icone: 'rota' },
  { para: '/admin/areas', rotulo: 'Áreas atendidas', icone: 'local' },
  { para: '/admin/cronogramas', rotulo: 'Cronogramas', icone: 'calendario' },
]

/**
 * Estrutura do painel administrativo: menu das seções ao lado
 * (no celular, em faixa rolável no topo) e o conteúdo da seção.
 */
function AdminPage() {
  return (
    <main className="admin-layout">
      <nav className="admin-menu" aria-label="Seções do painel administrativo">
        <p className="admin-menu__titulo">Painel administrativo</p>

        <ul className="admin-menu__lista">
          {SECOES.map((secao) => (
            <li key={secao.para}>
              <NavLink
                to={secao.para}
                end={secao.fim}
                className={({ isActive }) =>
                  `admin-menu__link ${isActive ? 'admin-menu__link--ativo' : ''}`
                }
              >
                <Icone nome={secao.icone} />
                {secao.rotulo}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="admin-layout__conteudo">
        <Outlet />
      </div>
    </main>
  )
}

export default AdminPage

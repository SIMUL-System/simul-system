import { useCallback, useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

import Alerta from '../components/Alerta'
import Icone from '../components/Icone'
import SeletorCidade from '../components/admin/SeletorCidade'

import { listarCidades } from '../services/adminCidadeService'
import { escolherCidadeInicial, lerCidadeSalva, salvarCidade } from '../utils/cidadeAdmin'
import { comoLista } from '../utils/texto'

import '../App.css'
import '../styles/admin.css'

const SECOES = [
  { para: '/admin', rotulo: 'Visão geral', icone: 'grade', fim: true },
  { para: '/admin/rotas', rotulo: 'Rotas', icone: 'rota' },
  { para: '/admin/areas', rotulo: 'Áreas atendidas', icone: 'local' },
  { para: '/admin/cronogramas', rotulo: 'Agenda da semana', icone: 'calendario' },
  { para: '/admin/quem-somos', rotulo: 'Quem somos', icone: 'usuario' },
]

/** Seções que não dependem da cidade. */
const SEM_CIDADE = ['/admin/quem-somos']

/**
 * Estrutura do painel administrativo: menu das seções ao lado (no celular,
 * em faixa rolável no topo), o seletor da cidade e o conteúdo da seção.
 * A cidade escolhida vale para todas as seções e fica salva no navegador.
 */
function AdminPage() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [cidades, setCidades] = useState(null)
  const [idEscolhido, setIdEscolhido] = useState(lerCidadeSalva)
  const [erro, setErro] = useState('')

  const recarregarCidades = useCallback(async () => {
    const lista = comoLista(await listarCidades())
    setCidades(lista)
    return lista
  }, [])

  // Recarrega os números das cidades a cada troca de seção.
  useEffect(() => {
    let ativo = true

    listarCidades()
      .then((lista) => {
        if (ativo) {
          setCidades(comoLista(lista))
          setErro('')
        }
      })
      .catch((error) => {
        if (ativo) setErro(error.message || 'Não foi possível carregar as cidades.')
      })

    return () => {
      ativo = false
    }
  }, [pathname])

  const usaCidade = !SEM_CIDADE.some((caminho) => pathname.startsWith(caminho))
  const cidade = cidades ? escolherCidadeInicial(cidades, idEscolhido) : null

  function trocarCidade(id) {
    setIdEscolhido(id)
    salvarCidade(id)

    // Filtros da cidade anterior (?rota=, ?mapa=) não valem para a nova.
    navigate(pathname, { replace: true })
  }

  let conteudo

  if (!usaCidade) {
    conteudo = <Outlet context={{ cidade, cidades: cidades ?? [], recarregarCidades }} />
  } else if (erro && !cidades) {
    conteudo = <Alerta tipo="erro">{erro}</Alerta>
  } else if (!cidades) {
    conteudo = (
      <div className="carregando" role="status">
        <span className="carregando__spinner" aria-hidden="true" />
        Carregando as cidades…
      </div>
    )
  } else if (!cidade) {
    conteudo = (
      <Alerta tipo="info">
        Nenhuma cidade cadastrada ainda. As cidades entram pelas migrations de importação dos dados
        das prefeituras.
      </Alerta>
    )
  } else {
    conteudo = (
      <>
        <SeletorCidade cidades={cidades} cidade={cidade} onTrocar={trocarCidade} />

        {/* key: ao trocar de cidade, a seção recomeça com os dados dela. */}
        <Outlet key={cidade.id} context={{ cidade, cidades, recarregarCidades, trocarCidade }} />
      </>
    )
  }

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

      <div className="admin-layout__conteudo">{conteudo}</div>
    </main>
  )
}

export default AdminPage

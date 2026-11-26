package com.simulsystem.backend.business.institucional.service;

import com.simulsystem.backend.business.institucional.dto.FotoInstituicaoResponseDTO;
import com.simulsystem.backend.business.institucional.dto.ImagemArquivoDTO;
import com.simulsystem.backend.business.institucional.dto.InstitucionalResponseDTO;
import com.simulsystem.backend.business.institucional.dto.IntegranteRequestDTO;
import com.simulsystem.backend.business.institucional.dto.IntegranteResponseDTO;
import com.simulsystem.backend.business.institucional.dto.TextosInstitucionaisRequestDTO;
import com.simulsystem.backend.business.institucional.model.ConteudoInstitucional;
import com.simulsystem.backend.business.institucional.model.FotoInstituicao;
import com.simulsystem.backend.business.institucional.model.Imagem;
import com.simulsystem.backend.business.institucional.model.Integrante;
import com.simulsystem.backend.business.institucional.repository.ConteudoInstitucionalRepository;
import com.simulsystem.backend.business.institucional.repository.FotoInstituicaoRepository;
import com.simulsystem.backend.business.institucional.repository.ImagemRepository;
import com.simulsystem.backend.business.institucional.repository.IntegranteRepository;
import com.simulsystem.backend.business.institucional.validation.ImagemValidation;
import com.simulsystem.backend.business.institucional.validation.InstitucionalValidation;
import com.simulsystem.backend.core.exception.ConteudoNaoEncontradoException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.function.BiConsumer;
import java.util.function.Function;

/** Implementação de InstitucionalService. */
@Service
public class InstitucionalServiceImpl implements InstitucionalService {

    private final ConteudoInstitucionalRepository conteudoRepository;
    private final FotoInstituicaoRepository fotoRepository;
    private final IntegranteRepository integranteRepository;
    private final ImagemRepository imagemRepository;
    private final ImagemValidation imagemValidation;
    private final InstitucionalValidation validation;

    public InstitucionalServiceImpl(
            ConteudoInstitucionalRepository conteudoRepository,
            FotoInstituicaoRepository fotoRepository,
            IntegranteRepository integranteRepository,
            ImagemRepository imagemRepository,
            ImagemValidation imagemValidation,
            InstitucionalValidation validation
    ) {
        this.conteudoRepository = conteudoRepository;
        this.fotoRepository = fotoRepository;
        this.integranteRepository = integranteRepository;
        this.imagemRepository = imagemRepository;
        this.imagemValidation = imagemValidation;
        this.validation = validation;
    }

    @Override
    @Transactional(readOnly = true)
    public InstitucionalResponseDTO buscar() {
        ConteudoInstitucional conteudo = buscarConteudo();

        return new InstitucionalResponseDTO(
                conteudo.getSobreProjeto(),
                conteudo.getInstituicaoNome(),
                conteudo.getInstituicaoTexto(),
                conteudo.getCurso(),
                fotoRepository.findAllByOrderByOrdemAscIdAsc().stream().map(this::converterFoto).toList(),
                integranteRepository.findAllByOrderByOrdemAscIdAsc().stream().map(this::converterIntegrante).toList()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ImagemArquivoDTO buscarImagem(Long id) {
        Imagem imagem = imagemRepository.findById(id)
                .orElseThrow(() -> new ConteudoNaoEncontradoException("Imagem não encontrada."));

        return new ImagemArquivoDTO(imagem.getTipoConteudo(), imagem.getDados());
    }

    @Override
    @Transactional
    public InstitucionalResponseDTO atualizarTextos(TextosInstitucionaisRequestDTO requestDTO) {
        ConteudoInstitucional conteudo = buscarConteudo();

        conteudo.setSobreProjeto(requestDTO.sobreProjeto().trim());
        conteudo.setInstituicaoNome(requestDTO.instituicaoNome().trim());
        conteudo.setInstituicaoTexto(requestDTO.instituicaoTexto().trim());
        conteudo.setCurso(requestDTO.curso().trim());

        conteudoRepository.save(conteudo);

        return buscar();
    }

    @Override
    @Transactional
    public FotoInstituicaoResponseDTO adicionarFoto(byte[] arquivo, String legenda) {
        String legendaValida = validation.validarLegenda(legenda);
        Imagem imagem = salvarImagem(arquivo);

        FotoInstituicao foto = new FotoInstituicao();
        foto.setImagemId(imagem.getId());
        foto.setLegenda(legendaValida);
        foto.setOrdem((int) fotoRepository.count());

        return converterFoto(fotoRepository.save(foto));
    }

    @Override
    @Transactional
    public FotoInstituicaoResponseDTO atualizarLegenda(Long fotoId, String legenda) {
        FotoInstituicao foto = validation.buscarFoto(fotoId);

        foto.setLegenda(legenda.trim());

        return converterFoto(fotoRepository.save(foto));
    }

    @Override
    @Transactional
    public void removerFoto(Long fotoId) {
        FotoInstituicao foto = validation.buscarFoto(fotoId);

        fotoRepository.delete(foto);
        imagemRepository.deleteById(foto.getImagemId());
    }

    @Override
    @Transactional
    public void reordenarFotos(List<Long> ids) {
        reordenar(fotoRepository.findAll(), ids, foto -> foto.getId(), (foto, ordem) -> foto.setOrdem(ordem));
    }

    @Override
    @Transactional
    public IntegranteResponseDTO cadastrarIntegrante(IntegranteRequestDTO requestDTO) {
        Integrante integrante = new Integrante();
        copiar(requestDTO, integrante);
        integrante.setOrdem((int) integranteRepository.count());

        return converterIntegrante(integranteRepository.save(integrante));
    }

    @Override
    @Transactional
    public IntegranteResponseDTO atualizarIntegrante(Long id, IntegranteRequestDTO requestDTO) {
        Integrante integrante = validation.buscarIntegrante(id);
        copiar(requestDTO, integrante);

        return converterIntegrante(integranteRepository.save(integrante));
    }

    @Override
    @Transactional
    public IntegranteResponseDTO atualizarFotoIntegrante(Long id, byte[] arquivo) {
        Integrante integrante = validation.buscarIntegrante(id);
        Long fotoAnterior = integrante.getFotoId();

        integrante.setFotoId(salvarImagem(arquivo).getId());
        Integrante salvo = integranteRepository.save(integrante);

        if (fotoAnterior != null) {
            imagemRepository.deleteById(fotoAnterior);
        }

        return converterIntegrante(salvo);
    }

    @Override
    @Transactional
    public IntegranteResponseDTO removerFotoIntegrante(Long id) {
        Integrante integrante = validation.buscarIntegrante(id);
        Long fotoAnterior = integrante.getFotoId();

        integrante.setFotoId(null);
        Integrante salvo = integranteRepository.save(integrante);

        if (fotoAnterior != null) {
            imagemRepository.deleteById(fotoAnterior);
        }

        return converterIntegrante(salvo);
    }

    @Override
    @Transactional
    public void removerIntegrante(Long id) {
        Integrante integrante = validation.buscarIntegrante(id);
        Long foto = integrante.getFotoId();

        integranteRepository.delete(integrante);

        if (foto != null) {
            imagemRepository.deleteById(foto);
        }
    }

    @Override
    @Transactional
    public void reordenarIntegrantes(List<Long> ids) {
        reordenar(
                integranteRepository.findAll(),
                ids,
                integrante -> integrante.getId(),
                (integrante, ordem) -> integrante.setOrdem(ordem));
    }

    /* ---------- auxiliares ---------- */

    private ConteudoInstitucional buscarConteudo() {
        return conteudoRepository.findById(ConteudoInstitucional.ID_UNICO)
                .orElseThrow(() -> new ConteudoNaoEncontradoException("Conteúdo do Quem somos não encontrado."));
    }

    private Imagem salvarImagem(byte[] arquivo) {
        String tipo = imagemValidation.validarEDetectarTipo(arquivo);

        Imagem imagem = new Imagem();
        imagem.setTipoConteudo(tipo);
        imagem.setDados(arquivo);
        imagem.setTamanhoBytes(arquivo.length);

        return imagemRepository.save(imagem);
    }

    private void copiar(IntegranteRequestDTO requestDTO, Integrante integrante) {
        integrante.setNome(requestDTO.nome().trim());
        integrante.setFuncao(requestDTO.funcao().trim());
        integrante.setDescricao(requestDTO.descricao().trim());
        integrante.setLink(validation.validarLink(requestDTO.link()));
    }

    /** Aplica a posição de cada id na lista enviada como nova ordem. */
    private <T> void reordenar(
            List<T> existentes,
            List<Long> ids,
            Function<T, Long> obterId,
            BiConsumer<T, Integer> definirOrdem
    ) {
        validation.validarOrdemCompleta(existentes.stream().map(obterId).toList(), ids);

        for (T item : existentes) {
            definirOrdem.accept(item, ids.indexOf(obterId.apply(item)));
        }
    }

    private FotoInstituicaoResponseDTO converterFoto(FotoInstituicao foto) {
        return new FotoInstituicaoResponseDTO(foto.getId(), foto.getImagemId(), foto.getLegenda(), foto.getOrdem());
    }

    private IntegranteResponseDTO converterIntegrante(Integrante integrante) {
        return new IntegranteResponseDTO(
                integrante.getId(),
                integrante.getNome(),
                integrante.getFuncao(),
                integrante.getDescricao(),
                integrante.getFotoId(),
                integrante.getLink(),
                integrante.getOrdem()
        );
    }
}

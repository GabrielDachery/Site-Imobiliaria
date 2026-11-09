import { useEffect, useRef, useState } from "react";

/**
 * Visualizador de fotos em tela cheia, com zoom.
 *
 * - Abre ao clicar numa foto da galeria do imóvel (ou no botão "Ampliar").
 * - Zoom: roda do mouse, duplo clique/toque (alterna 1x e 2,5x), botões + e −, ou pinça no celular.
 * - Mover a foto ampliada: arrastar com o mouse ou o dedo.
 * - Trocar de foto: setas ‹ › na tela, setas do teclado, ou deslizar para o lado (sem zoom).
 * - Fechar: botão ✕, tecla Esc, ou clicar no fundo escuro.
 */

interface LightboxGaleriaProps {
  imagens: string[];
  titulo: string;
  indiceInicial: number;
  onFechar: () => void;
}

interface Visao {
  zoom: number;
  x: number;
  y: number;
}

interface Ponto {
  x: number;
  y: number;
}

const ZOOM_MAXIMO = 6;
const ZOOM_DUPLO_TOQUE = 2.5;

export default function LightboxGaleria({
  imagens,
  titulo,
  indiceInicial,
  onFechar,
}: LightboxGaleriaProps) {
  const [indice, setIndice] = useState<number>(indiceInicial);
  const [visao, setVisaoEstado] = useState<Visao>({ zoom: 1, x: 0, y: 0 });
  const [arrastando, setArrastando] = useState<boolean>(false);

  const visaoRef = useRef<Visao>({ zoom: 1, x: 0, y: 0 });
  const palcoRef = useRef<HTMLDivElement>(null);
  const fotoRef = useRef<HTMLImageElement>(null);
  const ponteiros = useRef<Map<number, Ponto>>(new Map());
  const arrasto = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const deslizeInicioX = useRef<number | null>(null);
  const distanciaInicial = useRef<number>(0);
  const zoomInicial = useRef<number>(1);
  const moveu = useRef<boolean>(false);
  const ultimoToque = useRef<number>(0);

  const total = imagens.length;

  function aplicarVisao(nova: Visao) {
    visaoRef.current = nova;
    setVisaoEstado(nova);
  }

  // Impede a foto de "fugir" da tela ao arrastar com zoom
  function limitar(zoom: number, x: number, y: number): Visao {
    const palco = palcoRef.current;
    const foto = fotoRef.current;
    if (zoom <= 1 || !palco || !foto) {
      return { zoom: 1, x: 0, y: 0 };
    }
    const largura = foto.clientWidth * zoom;
    const altura = foto.clientHeight * zoom;
    const maxX = Math.max(0, (largura - palco.clientWidth) / 2);
    const maxY = Math.max(0, (altura - palco.clientHeight) / 2);
    return {
      zoom,
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }

  // Muda o zoom mantendo parado o ponto sob o cursor/dedo (quando informado)
  function mudarZoom(novoZoom: number, cx?: number, cy?: number) {
    const atual = visaoRef.current;
    const zoom = Math.max(1, Math.min(ZOOM_MAXIMO, novoZoom));
    let x = atual.x;
    let y = atual.y;
    const palco = palcoRef.current;
    if (palco && cx !== undefined && cy !== undefined) {
      const r = palco.getBoundingClientRect();
      const px = cx - r.left - r.width / 2;
      const py = cy - r.top - r.height / 2;
      x = px - (px - atual.x) * (zoom / atual.zoom);
      y = py - (py - atual.y) * (zoom / atual.zoom);
    }
    aplicarVisao(limitar(zoom, x, y));
  }

  function irParaFoto(i: number) {
    if (total === 0) return;
    setIndice((i + total) % total);
  }

  // Trocar de foto zera o zoom
  useEffect(() => {
    aplicarVisao({ zoom: 1, x: 0, y: 0 });
  }, [indice]);

  // Teclado + trava a rolagem da página por trás
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onFechar();
      } else if (e.key === "ArrowLeft") {
        setIndice((atual) => (atual - 1 + total) % total);
      } else if (e.key === "ArrowRight") {
        setIndice((atual) => (atual + 1) % total);
      } else if (e.key === "+" || e.key === "=") {
        mudarZoom(visaoRef.current.zoom * 1.4);
      } else if (e.key === "-") {
        mudarZoom(visaoRef.current.zoom / 1.4);
      }
    }
    window.addEventListener("keydown", aoTeclar);
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflowAnterior;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, onFechar]);

  // Roda do mouse (precisa de listener não passivo para poder impedir a rolagem da página)
  useEffect(() => {
    const palco = palcoRef.current;
    if (!palco) return;
    function aoRolar(e: WheelEvent) {
      e.preventDefault();
      const fator = e.deltaY < 0 ? 1.2 : 1 / 1.2;
      mudarZoom(visaoRef.current.zoom * fator, e.clientX, e.clientY);
    }
    palco.addEventListener("wheel", aoRolar, { passive: false });
    return () => {
      palco.removeEventListener("wheel", aoRolar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function distanciaEntreDedos(): number {
    const pontos = Array.from(ponteiros.current.values());
    if (pontos.length < 2) return 0;
    return Math.hypot(pontos[0].x - pontos[1].x, pontos[0].y - pontos[1].y);
  }

  function aoPressionar(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    ponteiros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    moveu.current = false;
    const v = visaoRef.current;
    if (ponteiros.current.size === 2) {
      distanciaInicial.current = distanciaEntreDedos();
      zoomInicial.current = v.zoom;
      arrasto.current = null;
      deslizeInicioX.current = null;
    } else {
      arrasto.current = { x: e.clientX, y: e.clientY, vx: v.x, vy: v.y };
      deslizeInicioX.current = v.zoom <= 1.01 ? e.clientX : null;
    }
    setArrastando(true);
  }

  function aoMover(e: React.PointerEvent<HTMLDivElement>) {
    if (!ponteiros.current.has(e.pointerId)) return;
    ponteiros.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (ponteiros.current.size === 2 && distanciaInicial.current > 0) {
      moveu.current = true;
      mudarZoom((zoomInicial.current * distanciaEntreDedos()) / distanciaInicial.current);
      return;
    }

    const inicio = arrasto.current;
    if (!inicio) return;
    if (visaoRef.current.zoom > 1.01) {
      const dx = e.clientX - inicio.x;
      const dy = e.clientY - inicio.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) moveu.current = true;
      aplicarVisao(limitar(visaoRef.current.zoom, inicio.vx + dx, inicio.vy + dy));
    } else if (Math.abs(e.clientX - inicio.x) > 6) {
      moveu.current = true;
    }
  }

  function aoSoltar(e: React.PointerEvent<HTMLDivElement>) {
    const tinha = ponteiros.current.has(e.pointerId);
    ponteiros.current.delete(e.pointerId);
    setArrastando(false);
    if (ponteiros.current.size < 2) distanciaInicial.current = 0;
    if (!tinha) return;

    // Deslizar para o lado (sem zoom) troca de foto
    const inicioX = deslizeInicioX.current;
    if (visaoRef.current.zoom <= 1.01 && inicioX !== null && Math.abs(e.clientX - inicioX) > 60) {
      irParaFoto(indice + (e.clientX < inicioX ? 1 : -1));
      deslizeInicioX.current = null;
      return;
    }

    if (moveu.current || ponteiros.current.size !== 0) return;

    // Toque/clique sem arrasto: duplo toque alterna o zoom; toque único fora da foto fecha
    const agora = Date.now();
    if (agora - ultimoToque.current < 320) {
      if (visaoRef.current.zoom > 1.01) {
        mudarZoom(1);
      } else {
        mudarZoom(ZOOM_DUPLO_TOQUE, e.clientX, e.clientY);
      }
      ultimoToque.current = 0;
      return;
    }
    ultimoToque.current = agora;

    const foto = fotoRef.current;
    if (foto && visaoRef.current.zoom <= 1.01) {
      const r = foto.getBoundingClientRect();
      const fora =
        e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
      if (fora) onFechar();
    }
  }

  const classePalco = [
    "lbxPalco",
    visao.zoom > 1.01 ? "lbxAmpliado" : "",
    arrastando ? "lbxArrastando" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="lbxFundo" role="dialog" aria-modal="true" aria-label="Foto ampliada">
      <div
        className={classePalco}
        ref={palcoRef}
        onPointerDown={aoPressionar}
        onPointerMove={aoMover}
        onPointerUp={aoSoltar}
        onPointerCancel={aoSoltar}
      >
        <img
          ref={fotoRef}
          className="lbxFoto"
          src={imagens[indice]}
          alt={`${titulo} — foto ${indice + 1}`}
          draggable={false}
          style={{
            transform: `translate(-50%, -50%) translate(${visao.x}px, ${visao.y}px) scale(${visao.zoom})`,
          }}
        />
      </div>

      <button type="button" className="lbxBtn lbxFechar" aria-label="Fechar" onClick={onFechar}>
        <i className="fa-solid fa-xmark" />
      </button>

      {total > 1 && (
        <>
          <button
            type="button"
            className="lbxBtn lbxAnterior"
            aria-label="Foto anterior"
            onClick={() => irParaFoto(indice - 1)}
          >
            <i className="fa-solid fa-chevron-left" />
          </button>
          <button
            type="button"
            className="lbxBtn lbxProxima"
            aria-label="Próxima foto"
            onClick={() => irParaFoto(indice + 1)}
          >
            <i className="fa-solid fa-chevron-right" />
          </button>
        </>
      )}

      <div className="lbxFerramentas">
        <button
          type="button"
          className="lbxBtn"
          aria-label="Diminuir"
          onClick={() => mudarZoom(visaoRef.current.zoom / 1.6)}
        >
          <i className="fa-solid fa-minus" />
        </button>
        <span className="lbxContador">
          {indice + 1} / {total}
        </span>
        <button
          type="button"
          className="lbxBtn"
          aria-label="Ampliar"
          onClick={() => mudarZoom(visaoRef.current.zoom * 1.6)}
        >
          <i className="fa-solid fa-plus" />
        </button>
      </div>
    </div>
  );
}

// O pre-loader (Diogo, 2026-09-28): em todas as paginas e tambem ao sair, quando se carrega numa
// ligacao do site («mete o loader a funcionar quando se troca de pagina»). Nao corre com movimento
// reduzido nem sem JavaScript: sem a classe `a-carregar` no <html>, o ecra de carga nem aparece.
// A entrada fica pelo menos 0,7 s na primeira pagina da visita, 0,25 s depois de uma saida (a
// barra continua de onde ficou) e 0,4 s nos outros casos, e nunca mais de 3 s; a saida desvanece
// o ecra de carga por cima da pagina e enche meia barra antes de navegar.
(function () {
  var reduzido = false;
  var primeira = true;
  var continua = false;
  try {
    reduzido = matchMedia("(prefers-reduced-motion: reduce)").matches;
    primeira = !sessionStorage.getItem("ec-carga");
    sessionStorage.setItem("ec-carga", "1");
    // Vem de uma saida por uma ligacao do site: a barra continua de onde ficou, em vez de voltar
    // a zero e o simbolo recomecar a pulsar (parecia que carregava duas vezes, Diogo 2026-09-28).
    continua = sessionStorage.getItem("ec-saida") === "1";
    sessionStorage.removeItem("ec-saida");
  } catch (e) {}
  if (reduzido) return;
  var raiz = document.documentElement;
  var inicio = Date.now();
  var minimo = primeira ? 700 : continua ? 250 : 400;
  var feito = false;
  raiz.classList.add("a-carregar");
  if (continua) raiz.classList.add("a-continuar");

  function sair() {
    if (feito) return;
    feito = true;
    setTimeout(function () {
      raiz.classList.add("carregado");
      setTimeout(function () {
        raiz.classList.remove("a-carregar", "a-continuar", "carregado");
      }, 450);
    }, Math.max(0, minimo - (Date.now() - inicio)));
  }
  if (document.readyState === "complete") sair();
  else addEventListener("load", sair);
  setTimeout(sair, 3000);

  // A saida: uma ligacao para outra pagina do site mostra o ecra de carga e so depois navega.
  // Ficam de fora as ancoras na mesma pagina, os mailto e tel, as ligacoes externas, as que
  // abrem noutra janela e os cliques com uma tecla (abrir num separador novo).
  document.addEventListener("click", function (ev) {
    if (ev.defaultPrevented || ev.button !== 0 || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;
    var a = ev.target.closest && ev.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || (url.pathname === location.pathname && url.hash)) return;
    ev.preventDefault();
    raiz.classList.remove("carregado");
    raiz.classList.add("a-carregar", "a-sair");
    try {
      sessionStorage.setItem("ec-saida", "1");
    } catch (e) {}
    setTimeout(function () {
      location.href = url.href;
    }, 280);
  });

  // Ao voltar atras, o browser pode repor a pagina da memoria com o ecra de saida ainda posto.
  addEventListener("pageshow", function (ev) {
    if (ev.persisted) raiz.classList.remove("a-carregar", "a-sair", "carregado");
  });
})();

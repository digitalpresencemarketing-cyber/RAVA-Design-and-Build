# RAVA Design + Build — Website

Site institucional premium (one-page), trilíngue (English · Español · Português), para **RAVA Design + Build** — *Delivering Beyond Expectations*.

Site estático: HTML + CSS + JavaScript puro, sem build. Basta publicar a pasta (Vercel, Netlify, GitHub Pages, Hostinger...).

## Estrutura

```
index.html              página completa (logo vetorizada embutida como SVG)
assets/css/style.css    design system + animações
assets/css/fonts.css    fontes self-hosted (Cormorant Garamond + Jost)
assets/js/i18n.js       traduções ES / PT (o inglês vem do próprio HTML)
assets/js/main.js       abertura, scroll suave, efeitos, idioma, formulário
assets/vendor/          Lenis (smooth scroll, MIT)
assets/img/             fotos dos projetos, logos SVG, favicon, og-image
```

## Rodar localmente

```bash
npx serve .        # ou: npx http-server .
```

## Destaques

- Abertura animada: a logo RAVA se monta letra por letra, contador 0–100% e cortina dupla revelando o site.
- Hero com foto em moldura em arco, selo giratório e linhas arquitetônicas.
- Galeria com rolagem horizontal (desktop) / swipe (celular) + lightbox.
- Texto-manifesto que acende palavra por palavra conforme o scroll.
- Cursor customizado, botões magnéticos, spotlight nos cards, ícones em linha (sem emojis).
- Seletor de idioma EN / ES / PT (lembra a escolha; também aceita `?lang=pt`).
- SEO: meta tags, Open Graph, schema.org `GeneralContractor`.
- Respeita `prefers-reduced-motion`; o conteúdo aparece mesmo se o JavaScript falhar.

## Pendências com o cliente

- **E-mail**: ainda não existe. Quando houver, adicionar no contato/rodapé.
- **Formulário**: hoje abre uma mensagem de texto (SMS) pré-preenchida para (508) 816-5070.
  Para receber por e-mail, crie um endpoint (Formspree, Web3Forms...) e cole em
  `CONFIG.formEndpoint` no topo de `assets/js/main.js`.
- **Serviços**: LVP Flooring (installation labor only), Painting, Drywall, Roofing,
  Kitchen & Bath Remodeling e Full Home Renovation.
- **Anúncio de flooring**: use o link `https://ravadesignbuild.vercel.app/#flooring`
  (abre direto na seção LVP; `?lang=es` / `?lang=pt` para os anúncios em outros idiomas).
- **Atendimento em 3 idiomas**: o site diz "Service in English, Español and Português". Confirmar.
- **Domínio**: ainda não registrado.

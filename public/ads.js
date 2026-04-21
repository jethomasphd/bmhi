// ═══════════════════════════════════════════════════════════════
// BMHI — Sponsored Partner Slot
//
// A single, quiet ad unit that runs inside the suite after the
// user completes an intervention. The placements are intentional:
//
//   · One card only. No stacked banners. No interstitials.
//   · Clinical partners only. Mental-health services whose audience
//     overlap with ours is near-total.
//   · Design system native. Same typography, palette, and spacing
//     as the rest of the suite — so it reads as part of the product,
//     not an afterthought glued on top.
//   · Dismissible. The × sits where the user expects it.
//   · No tracking. No storage. No pixels. Impression counts are
//     delegated to the partner's own landing URL if they need them.
//
// Placeholders below are non-clickable demo content. The live `url`
// will be supplied via the partner integration and rotated server-
// side (or set by BMHI_ADS.configure()).
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  // ─── Placeholder partner inventory ──────────────────────
  // Real URLs will be swapped in at deploy time. These are
  // demo-only so the card has something to render.
  var PARTNERS = [
    {
      brand: 'Talkspace',
      tagline: 'Talk to a licensed therapist this week.',
      detail: 'Message, video, or phone. Covered by most insurance.',
      cta: 'Learn more',
      url: '#placeholder-talkspace',
      tint: 'sage'
    },
    {
      brand: 'BetterHelp',
      tagline: 'A therapist for the search, not just the job.',
      detail: 'Matched in under 48 hours. Unlimited messaging.',
      cta: 'Learn more',
      url: '#placeholder-betterhelp',
      tint: 'water'
    }
  ];

  var _configured = null; // override via BMHI_ADS.configure()

  function pickPartner() {
    var list = _configured || PARTNERS;
    if (!list.length) return null;
    return list[Math.floor(Math.random() * list.length)];
  }

  // ─── Render ────────────────────────────────────────────
  // Inserts the card into `container`. Returns the card
  // element so callers can remove it cleanly on reset.
  function render(container, opts) {
    if (!container) return null;
    opts = opts || {};
    var partner = opts.partner || pickPartner();
    if (!partner) return null;

    var card = document.createElement('aside');
    card.className = 'bmhi-ad';
    card.setAttribute('role', 'complementary');
    card.setAttribute('aria-label', 'Sponsored clinical partner');
    card.setAttribute('data-tint', partner.tint || 'sage');

    var tag = document.createElement('div');
    tag.className = 'bmhi-ad-tag';
    tag.textContent = 'Sponsored · Clinical partner';
    card.appendChild(tag);

    var dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'bmhi-ad-dismiss';
    dismiss.setAttribute('aria-label', 'Dismiss sponsored partner');
    dismiss.innerHTML = '&times;';
    dismiss.addEventListener('click', function (e) {
      e.preventDefault();
      card.remove();
    });
    card.appendChild(dismiss);

    var brand = document.createElement('div');
    brand.className = 'bmhi-ad-brand';
    brand.textContent = partner.brand;
    card.appendChild(brand);

    var tagline = document.createElement('div');
    tagline.className = 'bmhi-ad-tagline';
    tagline.textContent = partner.tagline;
    card.appendChild(tagline);

    if (partner.detail) {
      var detail = document.createElement('div');
      detail.className = 'bmhi-ad-detail';
      detail.textContent = partner.detail;
      card.appendChild(detail);
    }

    var cta = document.createElement('a');
    cta.className = 'bmhi-ad-cta';
    cta.href = partner.url;
    cta.rel = 'sponsored noopener nofollow';
    cta.target = '_blank';
    cta.textContent = (partner.cta || 'Learn more') + ' →';
    card.appendChild(cta);

    container.appendChild(card);
    return card;
  }

  function configure(partners) {
    if (Array.isArray(partners)) _configured = partners.slice();
  }

  window.BMHI_ADS = {
    render: render,
    configure: configure,
    partners: function () { return (_configured || PARTNERS).slice(); }
  };

})();

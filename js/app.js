const AuctionApp = (() => {
  const authSessionKey = "primebid-authenticated";
  const roleStorageKey = "primebid-auth-role";
  const demoLoginPin = window.PRIMEBID_DEMO_PIN || "1234";

  const toast = (message, type = "info") => {
    let region = document.querySelector(".toast-region");
    if (!region) {
      region = document.createElement("div");
      region.className = "toast-region";
      region.setAttribute("aria-live", "polite");
      document.body.appendChild(region);
    }

    const item = document.createElement("div");
    item.className = `toast toast-${type}`;
    item.textContent = message;
    region.appendChild(item);

    window.setTimeout(() => item.classList.add("show"), 20);
    window.setTimeout(() => {
      item.classList.remove("show");
      window.setTimeout(() => item.remove(), 250);
    }, 3200);
  };

  const initTheme = () => {
    const saved = localStorage.getItem("auction-theme");
    if (saved === "light") document.body.classList.add("light-mode");

    document.querySelectorAll("[data-theme-toggle], .toggle-track").forEach((button) => {
      button.addEventListener("click", () => {
        document.body.classList.toggle("light-mode");
        localStorage.setItem("auction-theme", document.body.classList.contains("light-mode") ? "light" : "dark");
      });
    });
  };

  const initTabs = () => {
    document.querySelectorAll("[data-tab-target]").forEach((button) => {
      button.addEventListener("click", () => {
        const target = button.dataset.tabTarget;
        const scope = button.closest("[data-tabs]") || document;
        scope.querySelectorAll("[data-tab-target]").forEach((tab) => tab.classList.remove("active"));
        scope.querySelectorAll("[data-tab-panel]").forEach((panel) => panel.classList.remove("active"));
        button.classList.add("active");
        const panel = scope.querySelector(`[data-tab-panel="${target}"]`);
        if (panel) panel.classList.add("active");
      });
    });
  };

  const initWatchlist = () => {
    document.querySelectorAll("[data-watch]").forEach((button) => {
      button.addEventListener("click", () => {
        button.classList.toggle("active");
        toast(button.classList.contains("active") ? "Added to watchlist" : "Removed from watchlist", "success");
      });
    });
  };

  const initSearchAndFilters = () => {
    const searchable = document.querySelectorAll("[data-search-scope]");
    searchable.forEach((scope) => {
      const input = scope.querySelector("[data-search-input]");
      const form = input?.closest("form");
      const category = scope.querySelector("[data-category-filter]");
      const status = scope.querySelector("[data-status-filter]");
      const sort = scope.querySelector("[data-sort-filter]");
      const cards = Array.from(scope.querySelectorAll("[data-auction-card], [data-table-row]"));
      const count = scope.querySelector("[data-result-count]");

      const apply = () => {
        const term = (input?.value || "").toLowerCase();
        const cat = category?.value || "all";
        const stat = status?.value || "all";
        let visible = 0;

        cards.forEach((card) => {
          const text = card.textContent.toLowerCase();
          const cardCat = card.dataset.category || "all";
          const cardStatus = card.dataset.status || "all";
          const matchTerm = !term || text.includes(term);
          const matchCat = cat === "all" || cardCat === cat;
          const matchStatus = stat === "all" || cardStatus === stat;
          const show = matchTerm && matchCat && matchStatus;
          card.hidden = !show;
          if (show) visible += 1;
        });

        if (sort && scope.querySelector(".auction-grid")) {
          const grid = scope.querySelector(".auction-grid");
          cards
            .filter((card) => !card.hidden)
            .sort((a, b) => {
              if (sort.value === "price-asc") return Number(a.dataset.price) - Number(b.dataset.price);
              if (sort.value === "price-desc") return Number(b.dataset.price) - Number(a.dataset.price);
              if (sort.value === "bids") return Number(b.dataset.bids) - Number(a.dataset.bids);
              return Number(a.dataset.ends) - Number(b.dataset.ends);
            })
            .forEach((card) => grid.appendChild(card));
        }

        if (count) count.textContent = `${visible} result${visible === 1 ? "" : "s"}`;
      };

      [input, category, status, sort].forEach((control) => {
        if (control) control.addEventListener(control.tagName === "INPUT" ? "input" : "change", apply);
      });

      if (form) {
        form.addEventListener("submit", (event) => {
          event.preventDefault();
          apply();
        });
      }

      scope.querySelectorAll("[data-reset-filters]").forEach((button) => {
        button.addEventListener("click", () => {
          if (input) input.value = "";
          if (category) category.value = "all";
          if (status) status.value = "all";
          if (sort) sort.value = "ending";
          apply();
          toast("Filters reset", "info");
        });
      });

      apply();
    });
  };

  const initBidForm = () => {
    const form = document.querySelector("[data-bid-form]");
    if (!form) return;

    const minimum = Number(form.dataset.minimum || 0);
    form.querySelectorAll("[data-bid-option]").forEach((option) => {
      option.addEventListener("click", () => {
        const radio = option.querySelector("input[type='radio']");
        if (radio) radio.checked = true;
        form.querySelectorAll("[data-bid-option]").forEach((item) => item.classList.remove("selected"));
        option.classList.add("selected");
      });
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const type = form.querySelector("input[name='bid-type']:checked")?.value || "manual";
      const input = form.querySelector(type === "manual" ? "#manual-bid" : "#proxy-bid");
      const amount = Number(input?.value || 0);
      const agree = form.querySelector("#agree");

      if (!amount) return toast("Enter a bid amount first", "error");
      if (amount < minimum) return toast(`Minimum accepted bid is Rs ${minimum}`, "error");
      if (agree && !agree.checked) return toast("Accept the bidding terms before placing a bid", "error");

      toast(`${type === "proxy" ? "Auto-bid" : "Bid"} placed for Rs ${amount}`, "success");
      form.querySelector("[data-bid-preview]").textContent = `Your ${type} bid: Rs ${amount}`;
    });
  };

  const roleLabels = {
    admin: "Admin",
    auctioneer: "Auctioneer",
    auctionee: "Auctionee"
  };

  const roleDestinations = {
    admin: "admin-dashboard.html",
    auctioneer: "auctioneer-dashboard.html",
    auctionee: "auctionee-dashboard.html"
  };

  const pageAccess = {
    "index.html": ["auctionee"],
    "browse-auctions.html": ["auctionee"],
    "auction-details.html": ["auctionee"],
    "place-bid.html": ["auctionee"],
    "auctionee-dashboard.html": ["auctionee"],
    "auctioneer-dashboard.html": ["auctioneer"],
    "admin-dashboard.html": ["admin"],
    "admin-auctions.html": ["admin"],
    "admin-categories.html": ["admin"],
    "admin-users.html": ["admin"]
  };

  const normalizeRole = (role) => (roleLabels[role] ? role : "auctionee");

  const getSelectedRole = (form) => {
    const selected = form.querySelector("input[name='login-role']:checked, input[name='register-role']:checked");
    return normalizeRole(selected?.value);
  };

  const openRoleWorkspace = (role) => {
    const nextRole = normalizeRole(role);
    localStorage.setItem(roleStorageKey, nextRole);
    localStorage.setItem(authSessionKey, "true");
    window.setTimeout(() => {
      window.location.href = roleDestinations[nextRole];
    }, 760);
  };

  const hasValidDemoPin = (form) => {
    const pin = form.querySelector("[data-demo-pin]")?.value || "";
    if (pin === demoLoginPin) return true;
    toast(`Enter the correct demo PIN. Temporary PIN: ${demoLoginPin}`, "error");
    return false;
  };

  const initAccessGate = () => {
    const page = window.location.pathname.toLowerCase().split("/").pop() || "index.html";
    if (page !== "login.html" && localStorage.getItem(authSessionKey) !== "true") {
      window.location.href = "login.html";
      return false;
    }
    if (page !== "login.html") {
      const role = normalizeRole(localStorage.getItem(roleStorageKey));
      const allowedRoles = pageAccess[page];
      if (allowedRoles && !allowedRoles.includes(role)) {
        window.location.href = roleDestinations[role];
        return false;
      }
    }
    return true;
  };

  const initForms = () => {
    document.querySelectorAll("[data-demo-form]").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();

        if (form.id === "loginForm") {
          if (!hasValidDemoPin(form)) return;
          const role = getSelectedRole(form);
          toast(`Login successful. Opening ${roleLabels[role]} workspace.`, "success");
          openRoleWorkspace(role);
          return;
        }

        if (form.id === "registerForm") {
          if (!hasValidDemoPin(form)) return;
          const password = form.querySelector("#reg-password")?.value;
          const confirm = form.querySelector("#reg-confirm")?.value;
          if (password !== confirm) return toast("Passwords do not match", "error");
          const role = getSelectedRole(form);
          toast(`${roleLabels[role]} account created. Opening workspace.`, "success");
          openRoleWorkspace(role);
          return;
        }

        toast(form.dataset.success || "Saved successfully", "success");
      });
    });

    document.querySelectorAll("[data-toast]").forEach((button) => {
      button.addEventListener("click", () => toast(button.dataset.toast, button.dataset.toastType || "info"));
    });
  };

  const initCountdowns = () => {
    document.querySelectorAll("[data-countdown]").forEach((node) => {
      let seconds = Number(node.dataset.countdown);
      if (!seconds) return;

      const render = () => {
        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        node.textContent = `${days}d ${hours}h ${mins}m`;
        seconds = Math.max(0, seconds - 60);
      };

      render();
      window.setInterval(render, 60000);
    });
  };

  const initAiHub = () => {
    if (document.querySelector("[data-ai-hub]")) return;

    const historyKey = "primebid-ai-hub-history";
    const pagePath = window.location.pathname.toLowerCase();

    const getPageType = () => {
      if (pagePath.includes("place-bid")) return "bid";
      if (pagePath.includes("auction-details")) return "details";
      if (pagePath.includes("browse-auctions")) return "browse";
      if (pagePath.includes("login")) return "login";
      if (pagePath.includes("admin-dashboard")) return "admin-dashboard";
      if (pagePath.includes("admin-auctions")) return "admin-auctions";
      if (pagePath.includes("admin-users")) return "admin-users";
      if (pagePath.includes("admin-categories")) return "admin-categories";
      if (document.querySelector(".admin-container")) return "admin";
      return "home";
    };

    const readVisibleAuctions = () =>
      Array.from(document.querySelectorAll("[data-auction-card], .auction-card"))
        .filter((card) => !card.hidden)
        .slice(0, 4)
        .map((card) => {
          const title = card.querySelector(".auction-title, h3")?.textContent.trim() || "Auction lot";
          const price = card.querySelector(".price-bar, .auction-price")?.textContent.trim() || "";
          const time = card.querySelector(".auction-time, [data-countdown]")?.textContent.trim() || "";
          return [title, price, time].filter(Boolean).join(" - ");
        });

    const getContext = () => {
      const pageType = getPageType();
      const title = document.querySelector("h1")?.textContent.trim() || document.title || "PrimeBid";
      const bidForm = document.querySelector("[data-bid-form]");
      const resultCount = document.querySelector("[data-result-count]")?.textContent.trim();
      const auctions = readVisibleAuctions();
      const activeTab = document.querySelector(".tab-btn.active, [data-tab-target].active")?.textContent.trim();
      const currentBid = document.querySelector(".price-value, .summary-price, .price-bar")?.textContent.trim();

      return {
        pageType,
        title,
        minimumBid: bidForm?.dataset.minimum,
        resultCount,
        auctions,
        activeTab,
        currentBid
      };
    };

    const describeContext = () => {
      const context = getContext();
      if (context.pageType === "bid") {
        return `You are on the bid screen for ${context.title}. The minimum accepted bid is Rs ${context.minimumBid || "the listed minimum"}. I can help compare manual bidding and auto-bidding before you submit.`;
      }
      if (context.pageType === "details") {
        return `You are viewing lot details for ${context.title}. I can summarize the item, explain shipping or returns, and help you decide whether to place a manual bid or proxy bid.`;
      }
      if (context.pageType === "browse") {
        const lots = context.auctions.length ? ` Visible lots include ${context.auctions.join("; ")}.` : "";
        return `You are browsing auctions with ${context.resultCount || "the current filters"} showing.${lots}`;
      }
      if (context.pageType.includes("admin")) {
        return `You are in ${context.title}. I can help review auctions, users, categories, moderation steps, and admin actions shown on this page.`;
      }
      if (context.pageType === "login") {
        return "You are on membership access. Choose Admin, Auctioneer, or Auctionee before signing in so the system opens the right workspace.";
      }
      return "You are on PrimeBid home. I can help users find auctions, understand wallet balances, place bids, manage watchlists, and move to the right next step.";
    };

    const includesAny = (value, words) => words.some((word) => value.includes(word));

    const amountFrom = (value) => {
      const match = value.replace(/,/g, "").match(/\b\d+(\.\d+)?\b/);
      return match ? Number(match[0]) : 0;
    };

    const createReply = (message) => {
      const query = message.toLowerCase();
      const context = getContext();
      const askedAmount = amountFrom(query);

      if (includesAny(query, ["hello", "hi ", "hey", "help"])) {
        return `${describeContext()} Tell me what you want to do and I will guide you step by step.`;
      }

      if (includesAny(query, ["where am i", "this page", "what page", "what can you do"])) {
        return describeContext();
      }

      if (includesAny(query, ["bid", "bidding", "place bid", "auto-bid", "proxy", "minimum"])) {
        if (context.minimumBid) {
          if (askedAmount && askedAmount < Number(context.minimumBid)) {
            return `That bid looks too low for this lot. The minimum accepted bid here is Rs ${context.minimumBid}, so raise the amount before submitting.`;
          }
          if (askedAmount && askedAmount >= Number(context.minimumBid)) {
            return `Rs ${askedAmount} meets the minimum of Rs ${context.minimumBid}. Before submitting, choose manual bid for one fixed bid or proxy bid if you want the system to protect you up to your limit.`;
          }
          return `The bid form is ready. Minimum accepted bid is Rs ${context.minimumBid}. Manual bidding places one bid now; proxy bidding lets the system increase gradually up to your secret maximum.`;
        }
        return "To bid, open an auction lot, review the current price and timer, then use Place Bid. If you want protection from being outbid quickly, choose proxy bidding and set your maximum.";
      }

      if (includesAny(query, ["pay", "payment", "wallet", "mpesa", "m-pesa", "deposit", "refund", "escrow"])) {
        return "For payments, users should fund the wallet first, then the system can hold the required bid amount. High-value lots can use escrow so funds are released only after the sale checks out.";
      }

      if (includesAny(query, ["search", "filter", "find", "category", "sort", "ending soon"])) {
        const lots = context.auctions.length ? ` I can currently see: ${context.auctions.join("; ")}.` : "";
        return `Use the search box for item names, category filters for the type of goods, and status filters for live, ending, pending, or closed lots.${lots}`;
      }

      if (includesAny(query, ["watch", "watchlist", "save", "favorite", "heart"])) {
        return "Use the heart button on any lot to add or remove it from the watchlist. It is useful for tracking price movement before placing a bid.";
      }

      if (includesAny(query, ["login", "register", "account", "membership", "password"])) {
        return "Choose a role on the access form first: Admin opens moderation, Auctioneer opens listing uploads, and Auctionee opens bidding. If registering, make sure the password and confirmation match before submitting.";
      }

      if (includesAny(query, ["admin", "approve", "reject", "pause", "user", "category", "moderation"])) {
        return "Admin users can approve or reject lots, pause live auctions, review user health, and keep categories organized. On table pages, use search and filters first so you only act on the relevant records.";
      }

      if (includesAny(query, ["shipping", "return", "delivery", "documents", "verified", "condition"])) {
        return `Check the lot details tabs for description, shipping, and returns. For expensive lots, verify documents, condition notes, seller details, and delivery terms before bidding.`;
      }

      return `I understand you need help with "${message}". ${describeContext()} Try asking about bidding, payment, search, account access, shipping, or admin actions.`;
    };

    const loadMessages = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(historyKey) || "[]");
        if (Array.isArray(saved) && saved.length) return saved.slice(-12);
      } catch {
        return [];
      }
      return [
        {
          role: "assistant",
          text: "Hi, I am the PrimeBid AI Hub. I hover here on every page and can help with bids, payments, filters, accounts, and admin tasks."
        }
      ];
    };

    const hub = document.createElement("section");
    hub.className = "ai-hub";
    hub.dataset.aiHub = "true";
    hub.innerHTML = `
      <button class="ai-hub-launcher" type="button" data-ai-launcher aria-expanded="false" aria-controls="ai-hub-panel">
        <span class="ai-hub-launcher-icon">AI</span>
        <span class="ai-hub-launcher-text">Ask Hub</span>
      </button>
      <div class="ai-hub-panel" id="ai-hub-panel" role="dialog" aria-label="PrimeBid AI Hub" aria-modal="false">
        <div class="ai-hub-header">
          <div>
            <span class="ai-hub-kicker">Floating AI Hub</span>
            <h2>How can I help?</h2>
          </div>
          <button class="ai-hub-close" type="button" data-ai-close aria-label="Close AI Hub">x</button>
        </div>
        <p class="ai-hub-context" data-ai-context></p>
        <div class="ai-hub-suggestions" data-ai-suggestions></div>
        <div class="ai-hub-actions" aria-label="AI Hub quick actions">
          <button type="button" data-ai-action="focus-search">Focus search</button>
          <button type="button" data-ai-action="reset-filters">Reset filters</button>
          <button type="button" data-ai-action="open-auctions">Open auctions</button>
          <button type="button" data-ai-action="open-bid">Bid screen</button>
        </div>
        <div class="ai-hub-messages" data-ai-messages aria-live="polite"></div>
        <form class="ai-hub-form" data-ai-form>
          <label class="sr-only" for="ai-hub-input">Ask the AI Hub</label>
          <input id="ai-hub-input" type="text" data-ai-input placeholder="Ask about bids, payments, filters..." autocomplete="off">
          <button type="submit">Send</button>
        </form>
      </div>
    `;
    document.body.appendChild(hub);

    const launcher = hub.querySelector("[data-ai-launcher]");
    const panel = hub.querySelector(".ai-hub-panel");
    const close = hub.querySelector("[data-ai-close]");
    const contextNode = hub.querySelector("[data-ai-context]");
    const suggestionsNode = hub.querySelector("[data-ai-suggestions]");
    const messagesNode = hub.querySelector("[data-ai-messages]");
    const form = hub.querySelector("[data-ai-form]");
    const input = hub.querySelector("[data-ai-input]");
    let messages = loadMessages();

    const saveMessages = () => {
      localStorage.setItem(historyKey, JSON.stringify(messages.slice(-12)));
    };

    const renderMessages = () => {
      messagesNode.innerHTML = "";
      messages.forEach((message) => {
        const item = document.createElement("div");
        item.className = `ai-hub-message ${message.role}`;
        item.textContent = message.text;
        messagesNode.appendChild(item);
      });
      messagesNode.scrollTop = messagesNode.scrollHeight;
    };

    const suggestionPrompts = () => {
      const type = getPageType();
      if (type === "bid") return ["Can I place this bid?", "Manual or proxy bid?", "What happens after I win?"];
      if (type === "details") return ["Summarize this lot", "Should I use proxy bidding?", "What should I verify?"];
      if (type === "browse") return ["Find ending soon lots", "How do filters work?", "What should I bid on?"];
      if (type === "login") return ["Which role should I pick?", "Help me create an account", "Fix registration issues"];
      if (type.includes("admin")) return ["What needs attention?", "How do I approve safely?", "Summarize this admin page"];
      return ["Help me find an auction", "How do I place a bid?", "How does the wallet work?"];
    };

    const renderSuggestions = () => {
      contextNode.textContent = describeContext();
      suggestionsNode.innerHTML = "";
      suggestionPrompts().forEach((prompt) => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = prompt;
        button.addEventListener("click", () => sendPrompt(prompt));
        suggestionsNode.appendChild(button);
      });
    };

    const setOpen = (open) => {
      hub.classList.toggle("open", open);
      launcher.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) {
        renderSuggestions();
        window.setTimeout(() => input.focus(), 80);
      }
    };

    const sendPrompt = (text) => {
      const value = text.trim();
      if (!value) return;
      messages.push({ role: "user", text: value });
      renderMessages();
      input.value = "";

      const typing = document.createElement("div");
      typing.className = "ai-hub-message assistant typing";
      typing.textContent = "Thinking...";
      messagesNode.appendChild(typing);
      messagesNode.scrollTop = messagesNode.scrollHeight;

      window.setTimeout(() => {
        typing.remove();
        messages.push({ role: "assistant", text: createReply(value) });
        saveMessages();
        renderMessages();
      }, 360);
    };

    const runAction = (action) => {
      if (action === "focus-search") {
        const search = document.querySelector("[data-search-input], input[type='search'], .hero-search input, .compact-search input");
        if (search) {
          search.focus();
          toast("Search is ready", "info");
        } else {
          sendPrompt("Help me find an auction");
        }
        return;
      }

      if (action === "reset-filters") {
        const reset = document.querySelector("[data-reset-filters]");
        if (reset) {
          reset.click();
        } else {
          sendPrompt("How do filters work?");
        }
        return;
      }

      if (action === "open-auctions") {
        window.location.href = "browse-auctions.html";
        return;
      }

      if (action === "open-bid") {
        window.location.href = "place-bid.html";
      }
    };

    launcher.addEventListener("click", () => setOpen(!hub.classList.contains("open")));
    close.addEventListener("click", () => setOpen(false));
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      sendPrompt(input.value);
    });
    hub.querySelectorAll("[data-ai-action]").forEach((button) => {
      button.addEventListener("click", () => runAction(button.dataset.aiAction));
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && hub.classList.contains("open")) setOpen(false);
    });
    window.addEventListener("primebid-open-ai-hub", () => setOpen(true));

    renderMessages();
    renderSuggestions();
  };

  const init = () => {
    if (!initAccessGate()) return;
    initTheme();
    initTabs();
    initWatchlist();
    initSearchAndFilters();
    initBidForm();
    initForms();
    initCountdowns();
    initAiHub();
  };

  return { init, toast };
})();

document.addEventListener("DOMContentLoaded", AuctionApp.init);

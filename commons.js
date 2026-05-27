// Commons - Componentes e Funções Compartilhadas

// Carregar access control globalmente
(async function() {
    try {
        const response = await fetch('access_control.json');
        if (response.ok) {
            window.ACCESS_CONTROL = await response.json();
        }
    } catch (e) {
        console.warn('Could not load access_control.json:', e);
    }
})();

// Componente de Navegação
const NavBar = {
    template: `
    <nav class="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center gap-3 cursor-pointer" :onclick="getHomeUrl">
                    <div class="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                        Desafios
                    </div>
                </div>
                <div class="hidden md:flex gap-1">
                    <a href="index.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">Início</a>
                    <a v-if="!isLoggedIn" href="CadastroEmpresa.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">Empresa</a>
                    <a v-if="!isLoggedIn" href="CadastroInstituicao.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">Instituição</a>
                    <a v-if="!isLoggedIn" href="RecuperaSenha.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">Recuperar senha</a>
                </div>
                <div class="md:hidden">
                    <button class="text-gray-300 hover:text-white">Menu</button>
                </div>
                <div class="hidden md:flex items-center gap-3">
                    <a id="navUserLink" href="javascript:void(0)" onclick="(function(){ const u=window.StorageManager.getUser(); if(u) window.location.href=window.AppRoutes.getHomeUrl(); else window.location.href='login.html'; })()" class="text-gray-300 hover:text-white" style="text-decoration:none;">
                        <span id="navUserName">Entrar</span>
                    </a>
                    <button id="navLogoutBtn" onclick="window.StorageManager.logout()" class="ml-2 px-3 py-1 rounded bg-red-600 text-white" style="display:none">Sair</button>
                </div>
            </div>
        </div>
    </nav>
    `
};

// Sidebar compartilhada para telas com navegação lateral
const SideNav = {
    props: {
        brand: String,
        items: {
            type: Array,
            default: () => [],
        },
        activeHref: String,
    },
    data() {
        return {
            expanded: {}
        };
    },
    mounted() {
        try {
            // update view when localStorage changes (login/logout in other tabs)
            window.addEventListener('storage', () => {
                this.$forceUpdate && this.$forceUpdate();
            });
            // initialize expanded state for groups that contain the active href
            try {
                const menuInit = this.menuToRender || [];
                menuInit.forEach((it, i) => {
                    if (it && it.children && it.children.length) {
                        this.expanded[i] = (this.resolvedActive && this.resolvedActive.parentIndex === i);
                    }
                });
            } catch (e) {
                // ignore
            }
        } catch (e) {
            // ignore
        }
    },
    methods: {
        navigate(href) {
            window.location.href = href;
        },
        toggleExpand(index) {
            this.expanded[index] = !this.expanded[index];
        },
        isExpanded(index) {
            return !!this.expanded[index];
        },
        isChildActive(item) {
            if (!item || !item.children) return false;
            return item.children.some(c => c.href === this.activeHref);
        },
        isParentActiveIndex(index) {
            const r = this.resolvedActive || {};
            return r.parentIndex === index;
        },
        isChildActiveIndex(parentIndex, childIndex) {
            const r = this.resolvedActive || {};
            return r.parentIndex === parentIndex && r.childIndex === childIndex;
        },
        isLoggedIn() {
            return !!(StorageManager && StorageManager.getToken && StorageManager.getToken());
        },
        logout() {
            if (StorageManager && StorageManager.logout) StorageManager.logout();
        },
        getUser() {
            return StorageManager.getUser() || {};
        },
        getUserRole() {
            // Centralize role determination in AppRoutes.getCurrentRole()
            try {
                return AppRoutes.getCurrentRole();
            } catch (e) {
                const user = this.getUser();
                return AppRoutes.normalizeRole(
                    user.type ||
                        user.role ||
                        user.userType ||
                        user.tipoUsuario ||
                        localStorage.getItem('userType'),
                );
            }
        },
        getUserName() {
            const user = this.getUser();
            const role = this.getUserRole();

            if (!user || Object.keys(user).length === 0) return 'Usuário';

            const firstNonEmpty = (...keys) => {
                for (const k of keys) {
                    const v = user[k];
                    if (v !== undefined && v !== null) {
                        const s = String(v).trim();
                        if (s) return s;
                    }
                }
                return null;
            };

            // Prefer source (table) from login to decide which fields to show
            const src = ((user && (user.sourceTable || user._source)) || localStorage.getItem('userSource') || '').toLowerCase();
            let sourceRole = null;
            if (src) {
                if (src.includes('empresa')) sourceRole = 'empresa';
                else if (src.includes('instituic')) sourceRole = 'instituicao';
                else if (src.includes('coordenador')) sourceRole = 'coordenador';
                else if (src.includes('admin')) sourceRole = 'admin';
            }
            const effectiveRole = sourceRole || role;
            // DEBUG: report inference for troubleshooting
            try { console.debug('getUserName:inference', { src: src, sourceRole, role, effectiveRole }); } catch(e){}

            // Prefer role-specific display names (do not fallback to role label to avoid duplication)
            if (effectiveRole === 'empresa') {
                const val = firstNonEmpty('nomefantasia', 'nomeFantasia', 'NomeFantasia', 'fantasia', 'razaosocial', 'nome', 'name');
                try { console.debug('getUserName:value', { effectiveRole, val }); } catch(e){}
                return val || '';
            }

            if (effectiveRole === 'instituicao') {
                const val = firstNonEmpty(
                    'nomeinstituicao', 'nomeInstituicao', 'NomeInstituicao',
                    'nome_instituicao', 'nome_instituição', 'instituicaoNome', 'instituicao_nome',
                    'instituicao', 'sigla', 'nome', 'name', 'institutionName', 'institution_name'
                );

                // also try common nested shapes: user.instituicao.{nome|name}
                if (!val && user.instituicao && typeof user.instituicao === 'object') {
                    val = user.instituicao.nome || user.instituicao.name || user.instituicao.nomeInstituicao || user.instituicao.nomeinstituicao || null;
                }
                // try user.institution
                if (!val && user.institution && typeof user.institution === 'object') {
                    val = user.institution.name || user.institution.nome || null;
                }

                try { console.debug('getUserName:value', { effectiveRole, val }); } catch(e){}
                return val || '';
            }

            const val = firstNonEmpty('nome', 'name');
            try { console.debug('getUserName:value', { effectiveRole, val }); } catch(e){}
            return val || '';
        },
        getUserRoleLabel() {
            const labels = {
                empresa: 'Empresa',
                instituicao: 'Instituição',
                coordenador: 'Coordenador',
                admin: 'Administrador',
            };

            return labels[this.getUserRole()] || 'Instituição';
        },
        getUserRoleIcon() {
            const icons = {
                empresa: '🏢',
                instituicao: '🎓',
                coordenador: '🧭',
                admin: '⚙️',
            };

            return icons[this.getUserRole()] || '🎓';
        },
        getHomeUrl() {
            return AppRoutes.getHomeUrl(this.getUserRole());
        },
    },
    computed: {
        menuToRender() {
            try {
                const role = this.getUserRole();
                const menu = (typeof window !== 'undefined' && window.getMenuForRole)
                    ? window.getMenuForRole(role)
                    : (this.items || []);
                return menu || [];
            } catch (e) {
                return this.items || [];
            }
        }
        ,
        resolvedActive() {
            // determine which parent/child should be considered active
            try {
                const menu = this.menuToRender || [];
                const href = this.activeHref;
                if (!href) return { parentIndex: null, childIndex: null };

                // first look for child match (gives priority)
                for (let i = 0; i < menu.length; i++) {
                    const it = menu[i];
                    if (it && it.children && it.children.length) {
                        for (let j = 0; j < it.children.length; j++) {
                            if (it.children[j].href === href) {
                                return { parentIndex: i, childIndex: j };
                            }
                        }
                    }
                }

                // then look for parent match (first occurrence)
                for (let i = 0; i < menu.length; i++) {
                    const it = menu[i];
                    if (it && it.href === href) return { parentIndex: i, childIndex: null };
                }

                return { parentIndex: null, childIndex: null };
            } catch (e) {
                return { parentIndex: null, childIndex: null };
            }
        }
    },
    template: `
    <aside class="sidebar">
        <a class="sidebar-user" :href="getHomeUrl()" @click.prevent="navigate(getHomeUrl())">
            <span class="sidebar-user-icon" aria-hidden="true">{{ getUserRoleIcon() }}</span>
            <span class="sidebar-user-content">
                <span class="sidebar-user-name">{{ getUserName() }}</span>
                <span class="sidebar-user-role">{{ getUserRoleLabel() }}</span>
            </span>
        </a>
        <div class="brand">
            <span class="brand-icon"></span>
            <span>{{ brand }}</span>
        </div>
        <div class="menu">
            <div v-for="(item, idx) in menuToRender" :key="item.href || item.label" class="menu-group">
                <template v-if="item.children && item.children.length">
                    <div class="menu-item menu-parent" :class="{ active: isParentActiveIndex(idx) }" @click.prevent="toggleExpand(idx)">
                        <span class="menu-label">{{ item.label }}</span>
                        <span class="chevron" :class="{ open: isExpanded(idx) }">▾</span>
                    </div>
                    <div class="submenu" v-show="isExpanded(idx)">
                        <a v-for="(child, cidx) in item.children" :key="child.href" :href="child.href" class="menu-item child" :class="{ active: isChildActiveIndex(idx, cidx) }" @click.prevent="navigate(child.href)">{{ child.label }}</a>
                    </div>
                </template>
                <template v-else>
                    <a :href="item.href" class="menu-item" style="text-decoration: none;" :class="{ active: item.href === activeHref }" @click.prevent="navigate(item.href)">{{ item.label }}</a>
                </template>
            </div>
        </div>
        <div class="sidebar-footer">
            <button class="sidebar-logout-btn" v-if="isLoggedIn()" @click.prevent="logout()">Sair</button>
        </div>
    </aside>
    `
};

function buildSideNavItems(labels, activeHref, links) {
    return labels.map((label, index) => ({
        label,
        href: links[index],
        active: links[index] === activeHref,
    }));
}

function mountVuePage(options) {
    const { title, ...vueOptions } = options || {};
    const { createApp } = Vue;

    const app = createApp(vueOptions);

    app.mount('#app');

    if (title) {
        document.title = title;
    }

    return app;
}

// Helper to mount standard app pages with common pattern
function mountStandardApp({ mountSelector = '#app', title, components = {}, data, methods = {}, mounted } = {}) {
    const { createApp } = Vue;

    const options = {
        components,
        data: function() {
            const base = (typeof data === 'function') ? data() : (data || {});
            if (!base.msg && typeof window !== 'undefined') base.msg = window.messages || {};
            return base;
        },
        methods,
        mounted
    };

    const app = createApp(options);
    app.mount(mountSelector);

    if (title) document.title = title;

    return app;
}

// Componente Input Reutilizável
const FormInput = {
    template: `
    <div class="mb-4">
        <label class="block text-sm font-medium text-gray-200 mb-2">
            {{ label }}
            <span v-if="required" class="text-red-500">*</span>
        </label>
        <input 
            :type="type"
            :placeholder="placeholder"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            :class="[
                'w-full px-4 py-3 rounded-lg border-2 transition-all',
                'bg-slate-800 border-slate-700 text-white',
                'focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                error ? 'border-red-500' : ''
            ]"
        >
        <p v-if="error" class="text-red-400 text-sm mt-1">{{ error }}</p>
    </div>
    `,
    props: {
        label: String,
        type: { type: String, default: 'text' },
        placeholder: String,
        modelValue: String,
        required: Boolean,
        error: String
    },
    emits: ['update:modelValue']
};

// Componente Cartão de Proposta
const ProposalCard = {
    methods: {
        getDetailsLink() {
            const base = this.proposal && this.proposal.detailsLink
                ? this.proposal.detailsLink
                : 'tela-detalhes-proposta-coordenador.html';
            if (!this.proposal || !this.proposal.id) return base;
            return `${base}?id=${encodeURIComponent(this.proposal.id)}`;
        }
    },
    props: ['proposal', 'getStatusLabel'],
    template: `
    <div class="proposal-card card">
        <div class="proposal-icon">📋</div>
        <div class="proposal-main">
            <h3>{{ proposal.title || proposal.institution }}</h3>
            <p>{{ proposal.description || proposal.challenge }}</p>
        </div>
        <div class="proposal-actions">
            <span class="status-pill" :class="proposal.status === 'aprovada' || proposal.status === 'accepted' ? 'approved' : 'analysis'">
                {{ getStatusLabel ? getStatusLabel(proposal.status) : proposal.status }}
            </span>
            <a class="mini-btn" :href="getDetailsLink()">Ver detalhes</a>
        </div>
    </div>
    `
};

// Componente Cartão de Desafio
const ChallengeCard = {
    methods: {
        getDetailsHref() {
            const base = this.detailsLink || 'tela-detalhes-desafio-coordenador.html';
            if (!this.challenge || !this.challenge.id) return base;
            return `${base}?id=${encodeURIComponent(this.challenge.id)}`;
        }
    },
    props: ['challenge', 'icon', 'detailsLink'],
    template: `
    <div class="challenge-card card">
        <div class="challenge-icon">{{ icon || '📌' }}</div>
        <div class="challenge-body card-body">
            <h3>{{ challenge.title }}</h3>
            <p>{{ challenge.description }}</p>
            <div class="challenge-meta">{{ challenge.date || challenge.meta }}</div>
        </div>
        <a class="mini-btn" :href="getDetailsHref()">Ver detalhes</a>
    </div>
    `
};

// Componente Cartão de Problema
const ProblemCard = {
    methods: {
        getDetailsHref() {
            const base = (this.problem && this.problem.detailsLink) ? this.problem.detailsLink : 'detalhesProblema.html';
            if (!this.problem || !this.problem.id) return base;
            return `${base}?id=${encodeURIComponent(this.problem.id)}`;
        }
    },
    props: ['problem', 'showProposalCount'],
    template: `
    <div class="problem-card card">
        <div class="problem-icon">📌</div>
        <div class="problem-main">
            <h3>{{ problem.title }}</h3>
            <p>{{ problem.description }}</p>
            <span v-if="showProposalCount" class="proposal-count">{{ problem.proposals }} propostas</span>
        </div>
        <div class="problem-actions">
            <span class="deadline">{{ problem.deadline }}</span>
            <a :href="getDetailsHref()" class="mini-btn">Detalhes</a>
        </div>
    </div>
    `
};

// Funções de Validação
const ValidationFunctions = {
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    validatePhone(phone) {
        return /^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(phone);
    },
    validatePassword(password) {
        return password && password.length >= 6;
    },
    validateCNPJ(cnpj) {
        return /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(cnpj);
    }
};

// Rotas por perfil de usuário
const AppRoutes = {
    normalizeRole(role) {
        const value = String(role || '').trim().toLowerCase();

        if (['empresa', 'empresario', 'company'].includes(value)) return 'empresa';
        if (['instituicao', 'instituição', 'institution'].includes(value)) {
            return 'instituicao';
        }
        if (['coordenador', 'coordinator'].includes(value)) return 'coordenador';
        if (['admin', 'administrador'].includes(value)) return 'admin';

        return 'instituicao';
    },

    getCurrentRole() {
        const user = StorageManager.getUser();

        // Prefer explicit source table mapping when available
        try {
            const src = (user && (user.sourceTable || user._source)) || localStorage.getItem('userSource');
            if (src) {
                const s = String(src || '').toLowerCase();
                if (s.includes('empresa')) return 'empresa';
                if (s.includes('instituic')) return 'instituicao';
                if (s.includes('coordenador')) return 'coordenador';
                if (s.includes('admin')) return 'admin';
                // if source is 'usuarios' or similar, fallthrough to type-based inference
            }
        } catch (e) {
            // ignore and fallback to type-based inference
        }

        return this.normalizeRole(
            (user && (user.type || user.role || user.userType || user.tipoUsuario)) ||
                localStorage.getItem('userType'),
        );
    },

    getHomeUrl(role = this.getCurrentRole()) {
        const routes = {
            empresa: 'empresaDashboard.html',
            instituicao: 'tela-inicial-instituicao.html',
            coordenador: 'tela-inicial-coordenador.html',
            admin: 'tela-admin.html'
        };

        return routes[this.normalizeRole(role)] || routes.instituicao;
    },

    getNotificationsUrl() {
        return 'notificacoes.html';
    },

    getProposalsUrl(role = this.getCurrentRole()) {
        const routes = {
            empresa: 'propostas.html',
            instituicao: 'tela-propostas-instituicao.html',
            coordenador: 'tela-propostas-coordenador.html',
            admin: 'tela-admin.html'
        };

        return routes[this.normalizeRole(role)] || routes.instituicao;
    },

    go(url) {
        window.location.href = url;
    }
};

// ===================================
// UTILITÁRIOS COMPARTILHADOS
// ===================================

// Obter ID da query string
window.getIdFromQuery = function() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
};

// Formatar label de status
window.getStatusLabel = function(status) {
    const value = String(status || '').toLowerCase();
    if (!value) return '';
    if (value.includes('aceit') || value.includes('aprov')) return 'Aprovada';
    if (value.includes('reje') || value.includes('reprov')) return 'Rejeitada';
    if (value.includes('pend') || value.includes('anal')) return 'Pendente';
    return status;
};

// Verificar autenticação e redirecionar para login se necessário
window.checkAuth = function() {
    if (window.StorageManager && !window.StorageManager.getToken()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
};

// Carregar dados de proposta por ID
window.loadProposta = async function(id) {
    try {
        if (id) {
            return await window.ApiClient.get(`/propostas/${id}`);
        } else {
            const list = await window.ApiClient.get('/propostas');
            return (list && list[0]) ? list[0] : {};
        }
    } catch (e) {
        console.error('Erro ao carregar proposta:', e);
        return {};
    }
};

// Carregar dados de desafio por ID
window.loadDesafio = async function(id) {
    try {
        if (id) {
            // Try /desafios first, fall back to /problemas
            try {
                return await window.ApiClient.get(`/desafios/${id}`);
            } catch (e) {
                try {
                    return await window.ApiClient.get(`/problemas/${id}`);
                } catch (e2) {
                    throw e;
                }
            }
        } else {
            // For lists scoped to current user, prefer existing /me/desafios
            const lista = await window.ApiClient.get('/me/desafios');
            return (lista && lista[0]) ? lista[0] : {};
        }
    } catch (e) {
        console.error('Erro ao carregar desafio:', e);
        return {};
    }
};

// Fetch challenges list (try /desafios then /problemas)
window.fetchDesafiosList = async function() {
    try {
        return await window.ApiClient.get('/desafios');
    } catch (e) {
        try {
            return await window.ApiClient.get('/problemas');
        } catch (e2) {
            console.error('Erro ao buscar lista de desafios/problemas:', e2);
            return [];
        }
    }
};

// ===================================
// VALIDAÇÃO DE FORMULÁRIO
// ===================================

window.FormValidator = {
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    validatePassword(password) {
        return password && password.length >= 6;
    },
    
    validatePasswordMatch(password, confirmPassword) {
        return password === confirmPassword;
    },
    
    validateRequired(value) {
        return value && value.trim().length > 0;
    },
    
    validatePhone(phone) {
        const re = /^\(\d{2}\)\s\d{5}-\d{4}$/;
        return re.test(phone);
    },
    
    validateCNPJ(cnpj) {
        const re = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
        return re.test(cnpj);
    },
    
    validateEmailOrPhone(value) {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        const isPhone = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/.test(value);
        return isEmail || isPhone;
    }
};

// ===================================
// VUE MIXIN PARA FORMULÁRIOS DE AUTENTICAÇÃO
// ===================================

window.AuthFormMixin = {
    data() {
        return {
            form: {},
            errors: {},
            success: '',
            loading: false
        };
    },
    methods: {
        clearErrors() {
            this.errors = {};
        },
        
        setFieldError(field, message) {
            this.errors[field] = message;
        },
        
        hasErrors() {
            return Object.keys(this.errors).length > 0;
        },
        
        showSuccess(message) {
            this.success = message;
            setTimeout(() => { this.success = ''; }, 3000);
        },
        
        async submitForm(apiEndpoint, payload) {
            this.clearErrors();
            this.loading = true;
            
            try {
                const response = await window.ApiClient.post(apiEndpoint, payload);
                this.showSuccess(this.msg?.sucesso || 'Operação realizada com sucesso.');
                return response;
            } catch (err) {
                const message = err && err.message ? err.message : this.msg?.erroGenerico || 'Erro ao processar requisição';
                this.errors.general = message;
                throw err;
            } finally {
                this.loading = false;
            }
        }
    }
};

// ===================================
// API E AUTENTICAÇÃO
// ===================================

// API_BASE_URL é definido em config.js e exportado para window.API_BASE_URL
const API_BASE_URL = window.API_BASE_URL;

// Gerenciador de Token JWT
const StorageManager = {
    setToken(token) {
        localStorage.setItem('auth_token', token);
    },
    getToken() {
        return localStorage.getItem('auth_token');
    },
    clearToken() {
        localStorage.removeItem('auth_token');
    },
    setUser(user) {
        try {
            const copy = Object.assign({}, user || {});

            // normalize common id/email fields so downstream code can rely on copy.id and copy.email
            try {
                copy.id = copy.id || copy.ID || copy.usuarioid || copy.usuarioId || copy.userId || copy.user_id || copy.usuario_id || copy.id_usuario || null;
                if (!copy.id && user && (user.id === 0 || user.id)) copy.id = user.id; // keep falsy zero if present
            } catch (e) {}
            try { copy.email = copy.email || copy.Email || copy.usuarioEmail || copy.userEmail || copy.mail || null; } catch(e){}

            // if type is missing, attempt to infer/normalize from common fields
            if (!copy.type) {
                const inferred = (copy.tipoUsuario || copy.tipousuario || copy.role || copy.userType || copy.tipo || localStorage.getItem('userType')) || '';
                let role = AppRoutes && AppRoutes.normalizeRole ? AppRoutes.normalizeRole(inferred) : (String(inferred || '').toLowerCase());

                // further inference from profile fields
                if (!role || role === 'instituicao') {
                    if (copy.nomefantasia || copy.cnpj || copy.razaosocial) role = 'empresa';
                    else if (copy.nomeinstituicao || copy.instituicao || copy.sigla) role = 'instituicao';
                }

                copy.type = role || 'instituicao';
            }

            localStorage.setItem('auth_user', JSON.stringify(copy));
            localStorage.setItem('userType', copy.type);
            // infer source table (where login/profile likely came from)
            try {
                let src = copy.sourceTable || copy._source || '';
                if (!src) {
                    // prefer explicit type when available
                    const t = String(copy.type || '').toLowerCase();
                    if (t.includes('empresa')) src = 'empresas';
                    else if (t.includes('instituic') || t.includes('institui')) src = 'instituicoes';
                    else if (t.includes('coordenador')) src = 'coordenadores';
                    else if (t.includes('admin')) src = 'administradores';
                    else {
                        // fallback to field-based heuristics
                        if (copy.nomefantasia || copy.nomeFantasia || copy.cnpj || copy.razaosocial) src = 'empresas';
                        else if (copy.nomeinstituicao || copy.nomeInstituicao || copy.instituicaoNome || copy.instituicao) src = 'instituicoes';
                        else src = 'usuarios';
                    }
                }
                copy.sourceTable = src;
                localStorage.setItem('userSource', src);
                // update stored auth_user with sourceTable
                localStorage.setItem('auth_user', JSON.stringify(copy));
                try { console.debug('StorageManager.setUser', { type: copy.type, sourceTable: copy.sourceTable, sample: copy.nome || copy.nomeinstituicao || copy.nomefantasia || copy.name || copy.email }); } catch(e){}
            } catch (e) {
                // ignore
            }
        } catch (e) {
            try { localStorage.setItem('auth_user', JSON.stringify(user)); } catch(_){}
            if (user && user.type) localStorage.setItem('userType', user.type);
        }
    },
    getUser() {
        const user = localStorage.getItem('auth_user');
        return user ? JSON.parse(user) : null;
    },
    logout() {
        this.clearToken();
        this.clearUser();
        window.location.href = 'login.html';
    },
    clearUser() {
        localStorage.removeItem('auth_user');
        localStorage.removeItem('userType');
        localStorage.removeItem('userSource');
    }
};

// Cliente HTTP com Autenticação
const ApiClient = {
    async fetch(path, options = {}) {
        const token = StorageManager.getToken();
        const headers = {
            'Content-Type': 'application/json',
            ...(options.headers || {})
        };
        
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(`${API_BASE_URL}${path}`, {
                ...options,
                headers
            });
            
            // Se token expirou (401), logout
            if (response.status === 401 && token) {
                StorageManager.logout();
                return response;
            }
            
            return response;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    async get(path) {
        const response = await this.fetch(path, { method: 'GET' });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return response.json();
    },
    
    async post(path, data) {
        const response = await this.fetch(path, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.erro || `API Error: ${response.status}`);
        }
        return response.json();
    },
    
    async put(path, data) {
        const response = await this.fetch(path, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.erro || `API Error: ${response.status}`);
        }
        return response.json();
    },
    
    async delete(path) {
        const response = await this.fetch(path, { method: 'DELETE' });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return response.json();
    }
};

// Helper function to ensure user has required role(s) - redirect otherwise
function ensureRole(allowedRoles) {
    if (!Array.isArray(allowedRoles)) {
        allowedRoles = [allowedRoles];
    }
    
    const token = StorageManager.getToken();
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    
    const currentRole = AppRoutes.getCurrentRole();
    if (!allowedRoles.includes(currentRole)) {
        window.location.href = AppRoutes.getHomeUrl(currentRole);
        return false;
    }
    
    return true;
}

// Simples função de validação usando access_control.json
function checkPageAccess() {
    return window.validatePageAccess ? window.validatePageAccess() : true;
}

if (typeof window !== 'undefined') {
    // API_BASE_URL já é exportado pelo config.js, não redefinir aqui
    window.StorageManager = StorageManager;
    window.ApiClient = ApiClient;
    window.AppRoutes = AppRoutes;
    window.NavBar = NavBar;
    window.SideNav = SideNav;
    window.buildSideNavItems = buildSideNavItems;
    window.mountVuePage = mountVuePage;
    window.FormInput = FormInput;
    window.ProposalCard = ProposalCard;
    window.ChallengeCard = ChallengeCard;
    window.ProblemCard = ProblemCard;
    window.ValidationFunctions = ValidationFunctions;
    window.mountStandardApp = mountStandardApp;
    window.ensureRole = ensureRole;
    window.checkPageAccess = checkPageAccess;
}

// Auth UI helpers and access control
(function(){
    try{
        function refreshNavUser(){
            const nameEl = document.getElementById('navUserName');
            const logoutBtn = document.getElementById('navLogoutBtn');
            if(!nameEl && !logoutBtn) return;
            const user = StorageManager.getUser();
            if(user){
                // Prefer role-specific profile names (avoid showing email as primary label)
                const firstNonEmpty = (...keys) => {
                    for (const k of keys) {
                        const v = user[k];
                        if (v !== undefined && v !== null) {
                            const s = String(v).trim();
                            if (s) return s;
                        }
                    }
                    return null;
                };

                let displayName = firstNonEmpty('nome', 'name') || '';
                try {
                    const role = AppRoutes.getCurrentRole();
                    const src = ((user && (user.sourceTable || user._source)) || localStorage.getItem('userSource') || '').toLowerCase();
                    let sourceRole = null;
                    if (src) {
                        if (src.includes('empresa')) sourceRole = 'empresa';
                        else if (src.includes('instituic')) sourceRole = 'instituicao';
                        else if (src.includes('coordenador')) sourceRole = 'coordenador';
                        else if (src.includes('admin')) sourceRole = 'admin';
                    }
                    const effectiveRole = sourceRole || role;
                    try { console.debug('refreshNavUser:inference', { user, src, sourceRole, role, effectiveRole }); } catch(e){}
                    if (effectiveRole === 'empresa') {
                        displayName = firstNonEmpty('nomefantasia', 'nomeFantasia', 'NomeFantasia', 'fantasia', 'razaosocial', 'nome', 'name') || '';
                    }
                    if (effectiveRole === 'instituicao') {
                        displayName = firstNonEmpty(
                            'nomeinstituicao', 'nomeInstituicao', 'NomeInstituicao',
                            'nome_instituicao', 'nome_instituição', 'instituicaoNome', 'instituicao_nome',
                            'instituicao', 'sigla', 'nome', 'name', 'institutionName'
                        ) || null;

                        if (!displayName && user.instituicao && typeof user.instituicao === 'object') {
                            displayName = user.instituicao.nome || user.instituicao.name || user.instituicao.nomeInstituicao || user.instituicao.nomeinstituicao || displayName;
                        }
                        if (!displayName && user.institution && typeof user.institution === 'object') {
                            displayName = user.institution.name || user.institution.nome || displayName;
                        }
                        displayName = displayName || '';
                    }
                } catch(e) {
                    // ignore
                }
                if(nameEl) nameEl.textContent = displayName;
                if(logoutBtn) logoutBtn.style.display = 'inline-block';
            } else {
                if(nameEl) nameEl.textContent = 'Entrar';
                if(logoutBtn) logoutBtn.style.display = 'none';
            }
        }

        window.refreshNavUser = refreshNavUser;

        // Verificar acesso a uma página específica
        window.hasAccess = function(pageName, role) {
            try {
                const accessControl = window.ACCESS_CONTROL;
                if (!accessControl || !accessControl.pages) return false;
                
                const pageRoles = accessControl.pages[pageName];
                if (!pageRoles) return false; // página não existe no mapa
                
                // admin tem acesso a tudo
                if (accessControl.admin_has_access_to_all && role === 'admin') {
                    return true;
                }
                
                // public pages qualquer um acessa
                if (pageRoles.includes('public')) {
                    return true;
                }
                
                // verifica se o role tem acesso
                return pageRoles.includes(role);
            } catch (e) {
                console.warn('Error checking access:', e);
                return false;
            }
        };

        // Validar acesso e redirecionar se necessário
        window.validatePageAccess = function() {
            const token = StorageManager.getToken();
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const role = AppRoutes.getCurrentRole();
            
            // páginas públicas não precisam de token
            const accessControl = window.ACCESS_CONTROL;
            const pageRoles = accessControl && accessControl.pages ? accessControl.pages[currentPage] : null;
            
            if (pageRoles && pageRoles.includes('public')) {
                return true; // acesso permitido, é página pública
            }
            
            // qualquer outra página precisa de autenticação
            if (!token) {
                window.location.href = 'login.html';
                return false;
            }
            
            // verifica se tem acesso à página
            if (!window.hasAccess(currentPage, role)) {
                window.location.href = AppRoutes.getHomeUrl(role);
                return false;
            }
            
            return true;
        };

        // access control helper: allowedRoles array or single role
        window.requireRole = function(allowedRoles){
            if(!allowedRoles) return;
            const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
            const token = StorageManager.getToken();
            if(!token){
                window.location.href = 'login.html';
                return false;
            }
            const role = AppRoutes.getCurrentRole();
            if(!roles.includes(role)){
                // redirect to user's home
                window.location.href = AppRoutes.getHomeUrl(role);
                return false;
            }
            return true;
        };

        // initialize shortly after load
        setTimeout(refreshNavUser, 50);
        window.addEventListener('storage', refreshNavUser);
    }catch(e){
        console.warn('Auth UI helpers init failed', e);
    }
})();

// Admin menu factory for reuse across admin pages
window.getAdminMenuItems = function(){
    return [
        { label: 'Dashboard geral', href: 'tela-admin.html' },
        { label: 'Notificações', href: 'notificacoes.html' },
        { label: 'Aprovações', href: 'aprovacoes.html' },
        { label: 'Empresas', children: [
            { label: 'Problemas', href: 'empresa-problemas.html' },
            { label: 'Propostas', href: 'empresa-propostas.html' }
        ] },
        { label: 'Instituições', children: [
            { label: 'Desafios', href: 'instituicao-desafios.html' },
            { label: 'Propostas', href: 'instituicao-propostas.html' }
        ] },
        { label: 'Configurações', children: [
            { label: 'Alterar senha', href: 'alterar-senha.html' },
            { label: 'Usuários', href: 'usuarios.html' }
        ] }
    ];
};

// helper to normalize and remove duplicate hrefs from any menu
function _normalizeMenuGeneric(menu){
    const seen = new Set();
    const out = [];
    for(const item of menu){
        const copy = Object.assign({}, item);
        if(copy.children && Array.isArray(copy.children)){
            const children = [];
            for(const child of copy.children){
                if(!child || !child.href) continue;
                if(seen.has(child.href)) continue;
                seen.add(child.href);
                children.push(child);
            }
            copy.children = children;
            if(copy.href && seen.has(copy.href)) delete copy.href;
            out.push(copy);
            continue;
        }
        if(copy.href){
            if(seen.has(copy.href)) continue;
            seen.add(copy.href);
        }
        out.push(copy);
    }
    return out;
}

// Role-based menu factory for all roles
window.getMenuForRole = function(role){
    role = String(role || '').toLowerCase();
    if(role === 'admin') return window.getAdminMenuItems();

    if(role === 'empresa'){
        return _normalizeMenuGeneric([
            { label: 'Dashboard', href: 'empresaDashboard.html' },
            { label: 'Novo Desafio', href: 'criaProblema.html' },
            { label: 'Meus Desafios', href: 'empresaDashboard.html' },
            { label: 'Propostas', href: 'propostas.html' },
            { label: 'Instituições', href: 'selecaoInstituicoes.html' },
            { label: 'Notificações', href: 'notificacoes.html' },
            { label: 'Configurações', children: [ { label: 'Alterar senha', href: 'alterar-senha.html' } ] }
        ]);
    }

    if(role === 'instituicao'){
        return _normalizeMenuGeneric([
            { label: 'Início', href: 'tela-inicial-instituicao.html' },
            { label: 'Desafios', href: 'tela-inicial-instituicao.html' },
            { label: 'Propostas', href: 'tela-propostas-instituicao.html' },
            { label: 'Notificações', href: 'notificacoes.html' },
            { label: 'Configurações', children: [ { label: 'Alterar senha', href: 'alterar-senha.html' } ] }
        ]);
    }

    if(role === 'coordenador'){
        return _normalizeMenuGeneric([
            { label: 'Início', href: 'tela-inicial-coordenador.html' },
            { label: 'Desafios', href: 'tela-inicial-coordenador.html' },
            { label: 'Propostas', href: 'tela-propostas-coordenador.html' },
            { label: 'Notificações', href: 'notificacoes.html' },
            { label: 'Configurações', children: [ { label: 'Alterar senha', href: 'alterar-senha.html' } ] }
        ]);
    }

    // default public menu
    const publicMenu = [
        { label: 'Início', href: 'index.html' },
        { label: 'Login', href: 'login.html' },
        { label: 'Cadastro Empresa', href: 'CadastroEmpresa.html' },
        { label: 'Cadastro Instituição', href: 'CadastroInstituicao.html' }
    ];

    // normalize to remove duplicate hrefs
    function normalizeMenu(menu){
        const seen = new Set();
        const out = [];
        for(const item of menu){
            const copy = Object.assign({}, item);
            // if has children, normalize children first
            if(copy.children && Array.isArray(copy.children)){
                const children = [];
                for(const child of copy.children){
                    if(!child || !child.href) continue;
                    if(seen.has(child.href)) continue;
                    seen.add(child.href);
                    children.push(child);
                }
                copy.children = children;
                // if parent href duplicates a child or seen, remove parent href to avoid duplication
                if(copy.href && seen.has(copy.href)){
                    delete copy.href;
                }
                // prefer to keep parents even if no href, as container for children
                out.push(copy);
                continue;
            }

            // simple item
            if(copy.href){
                if(seen.has(copy.href)) continue;
                seen.add(copy.href);
            }
            out.push(copy);
        }
        return out;
    }

    return normalizeMenu(publicMenu);
};

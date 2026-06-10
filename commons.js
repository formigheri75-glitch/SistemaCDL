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

// Componente de Navegação Corrigido - Com Nomes Específicos
const NavBar = {
    template: `
    <nav class="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center gap-3 cursor-pointer" @click="goToHome">
                    <div class="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                        Desafios
                    </div>
                </div>
                
                <div class="hidden md:flex gap-1">
                    <template v-if="!isLoggedIn">
                        <a href="index.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">Inicio</a>
                        <a href="CadastroEmpresa.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">Cadastro Empresa</a>
                        <a href="CadastroInstituicao.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">Cadastro Instituicao</a>
                        <a href="RecuperaSenha.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">Recuperar senha</a>
                    </template>
                    
                    <template v-else>
                        <a :href="dashboardLink" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">
                            Dashboard
                        </a>
                        
                        <template v-if="userRole === 'empresa'">
                            <a href="criaProblema.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">
                                Novo Desafio
                            </a>
                            <a href="propostas.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">
                                Propostas
                            </a>
                        </template>
                        
                        <template v-if="userRole === 'instituicao'">
                            <a href="tela-propostas-instituicao.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">
                                Propostas Recebidas
                            </a>
                        </template>
                        
                        <template v-if="userRole === 'coordenador'">
                            <a href="tela-propostas-coordenador.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">
                                Analise de Propostas
                            </a>
                        </template>
                        
                        <template v-if="userRole === 'admin'">
                            <a href="aprovacoes.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">
                                Aprovacoes
                            </a>
                            <a href="usuarios.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">
                                Usuarios
                            </a>
                        </template>
                        
                        <a href="notificacoes.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">
                            Notificacoes
                        </a>
                    </template>
                </div>
                
                <div class="md:hidden">
                    <button @click="toggleMobileMenu" class="text-gray-300 hover:text-white text-2xl">
                        ☰
                    </button>
                </div>
                
                <div class="hidden md:flex items-center gap-3">
                    <template v-if="isLoggedIn">
                        <div class="flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800">
                            <span class="text-blue-400">{{ getUserIcon() }}</span>
                            <span class="text-gray-300 text-sm font-medium">{{ getUserDisplayName() }}</span>
                            <span class="text-xs text-cyan-400">({{ getUserRoleLabel() }})</span>
                        </div>
                        <button @click="logout" class="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-all">
                            Sair
                        </button>
                    </template>
                    <template v-else>
                        <a href="login.html" class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all">
                            Entrar
                        </a>
                    </template>
                </div>
            </div>
        </div>
        
        <div v-if="mobileMenuOpen" class="md:hidden bg-slate-900 border-t border-slate-800">
            <div class="px-4 py-2 space-y-1">
                <template v-if="!isLoggedIn">
                    <a href="index.html" class="block px-4 py-2 text-gray-300 hover:bg-slate-800 rounded">Inicio</a>
                    <a href="CadastroEmpresa.html" class="block px-4 py-2 text-gray-300 hover:bg-slate-800 rounded">Cadastro Empresa</a>
                    <a href="CadastroInstituicao.html" class="block px-4 py-2 text-gray-300 hover:bg-slate-800 rounded">Cadastro Instituicao</a>
                    <a href="RecuperaSenha.html" class="block px-4 py-2 text-gray-300 hover:bg-slate-800 rounded">Recuperar senha</a>
                </template>
                <template v-else>
                    <div class="px-4 py-2 border-b border-slate-700 mb-2">
                        <div class="text-gray-300 font-medium">{{ getUserDisplayName() }}</div>
                        <div class="text-xs text-cyan-400">{{ getUserRoleLabel() }}</div>
                    </div>
                    <a :href="dashboardLink" class="block px-4 py-2 text-gray-300 hover:bg-slate-800 rounded">Dashboard</a>
                    <template v-if="userRole === 'empresa'">
                        <a href="criaProblema.html" class="block px-4 py-2 text-gray-300 hover:bg-slate-800 rounded">Novo Desafio</a>
                        <a href="propostas.html" class="block px-4 py-2 text-gray-300 hover:bg-slate-800 rounded">Propostas</a>
                    </template>
                    <template v-if="userRole === 'instituicao'">
                        <a href="tela-propostas-instituicao.html" class="block px-4 py-2 text-gray-300 hover:bg-slate-800 rounded">Propostas Recebidas</a>
                    </template>
                    <template v-if="userRole === 'coordenador'">
                        <a href="tela-propostas-coordenador.html" class="block px-4 py-2 text-gray-300 hover:bg-slate-800 rounded">Analise de Propostas</a>
                    </template>
                    <template v-if="userRole === 'admin'">
                        <a href="aprovacoes.html" class="block px-4 py-2 text-gray-300 hover:bg-slate-800 rounded">Aprovacoes</a>
                        <a href="usuarios.html" class="block px-4 py-2 text-gray-300 hover:bg-slate-800 rounded">Usuarios</a>
                    </template>
                    <a href="notificacoes.html" class="block px-4 py-2 text-gray-300 hover:bg-slate-800 rounded">Notificacoes</a>
                    <hr class="border-slate-700 my-2">
                    <button @click="logout" class="w-full text-left px-4 py-2 text-red-400 hover:bg-slate-800 rounded">Sair</button>
                </template>
            </div>
        </div>
    </nav>
    `,
    
    data() {
        return {
            mobileMenuOpen: false
        };
    },
    
    computed: {
        isLoggedIn() {
            return !!(StorageManager && StorageManager.getToken && StorageManager.getToken());
        },
        userRole() {
            if (!this.isLoggedIn) return null;
            return AppRoutes.getCurrentRole();
        },
        userData() {
            return StorageManager.getUser() || {};
        },
        dashboardLink() {
            if (!this.isLoggedIn) return 'login.html';
            return AppRoutes.getHomeUrl(this.userRole);
        }
    },
    
    methods: {
        goToHome() {
            window.location.href = this.dashboardLink;
        },
        toggleMobileMenu() {
            this.mobileMenuOpen = !this.mobileMenuOpen;
        },
        logout() {
            if (StorageManager && StorageManager.logout) {
                StorageManager.logout();
            }
        },
        
        getUserDisplayName() {
            if (!this.isLoggedIn) return 'Entrar';
            
            const user = this.userData;
            const role = this.userRole;
            
            if (role === 'empresa') {
                return user.nomefantasia || user.nomeFantasia || user.razaosocial || user.email || 'Empresa';
            }
            
            if (role === 'instituicao') {
                return user.nomeinstituicao || user.nomeInstituicao || user.instituicao || user.email || 'Instituicao';
            }
            
            if (role === 'coordenador' || role === 'admin') {
                return user.nome || user.name || user.email || 'Usuario';
            }
            
            return user.email || 'Usuario';
        },
        
        getUserRoleLabel() {
            const labels = {
                empresa: 'Empresa',
                instituicao: 'Instituicao',
                coordenador: 'Coordenador',
                admin: 'Admin'
            };
            return labels[this.userRole] || 'Usuario';
        },
        
        getUserIcon() {
            const icons = {
                empresa: '🏢',
                instituicao: '🎓',
                coordenador: '🧭',
                admin: '⚙️'
            };
            return icons[this.userRole] || '👤';
        }
    },
    
    mounted() {
        window.addEventListener('storage', () => {
            this.$forceUpdate();
        });
        this.$forceUpdate();
    }
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
            window.addEventListener('storage', () => {
                this.$forceUpdate && this.$forceUpdate();
            });
            try {
                const menuInit = this.menuToRender || [];
                menuInit.forEach((it, i) => {
                    if (it && it.children && it.children.length) {
                        this.expanded[i] = (this.resolvedActive && this.resolvedActive.parentIndex === i);
                    }
                });
            } catch (e) {}
        } catch (e) {}
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
            try {
                const u = this.getUser() || {};
                const explicit = (u.type || u.tipo || u.tipousuario || u.userType || localStorage.getItem('userType'));
                if (explicit) return AppRoutes.normalizeRole(explicit);
                return AppRoutes.getCurrentRole();
            } catch (e) {
                const user = this.getUser();
                return AppRoutes.normalizeRole(
                    user && (user.type || user.role || user.userType || user.tipoUsuario) || localStorage.getItem('userType')
                );
            }
        },
        getUserDisplayName() {
            if (!this.isLoggedIn()) return 'Entrar';
            
            const user = this.getUser();
            const role = this.getUserRole();
            
            if (role === 'empresa') {
                return user.nomefantasia || user.nomeFantasia || user.razaosocial || user.email || 'Empresa';
            }
            
            if (role === 'instituicao') {
                return user.nomeinstituicao || user.nomeInstituicao || user.instituicao || user.email || 'Instituicao';
            }
            
            if (role === 'coordenador' || role === 'admin') {
                return user.nome || user.name || user.email || 'Usuario';
            }
            
            return user.email || 'Usuario';
        },
        getUserRoleLabel() {
            const labels = {
                empresa: 'Empresa',
                instituicao: 'Instituicao',
                coordenador: 'Coordenador',
                admin: 'Administrador',
            };
            try {
                const info = window.resolveUserDisplay(this.getUser());
                return info.roleLabel || (labels[this.getUserRole()] || 'Instituicao');
            } catch (e) {
                return labels[this.getUserRole()] || 'Instituicao';
            }
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
        },
        resolvedActive() {
            try {
                const menu = this.menuToRender || [];
                const href = this.activeHref;
                if (!href) return { parentIndex: null, childIndex: null };

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
                <span class="sidebar-user-name">{{ getUserDisplayName() }}</span>
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

window.debugAuthInfo = function() {
    const user = StorageManager.getUser();
    const source = localStorage.getItem('userSource');
    const userType = localStorage.getItem('userType');
    const role = AppRoutes.getCurrentRole();
    const display = window.resolveUserDisplay(user);
    
    console.group('Auth Info');
    console.log('Source Table:', source);
    console.log('User Type:', userType);
    console.log('Role:', role);
    console.log('Display Name:', display.name);
    console.log('Display Role:', display.roleLabel);
    console.log('User Data:', user);
    console.groupEnd();
    
    return { user, source, userType, role, display };
};

const AppRoutes = {
    normalizeRole(role) {
        const value = String(role || '').trim().toLowerCase();
        
        if (['empresa', 'empresario', 'company'].includes(value)) return 'empresa';
        if (['instituicao', 'instituição', 'institution'].includes(value)) return 'instituicao';
        if (['coordenador', 'coordinator'].includes(value)) return 'coordenador';
        if (['admin', 'administrador'].includes(value)) return 'admin';
        
        return 'instituicao';
    },

    getCurrentRole() {
        const user = StorageManager.getUser();
        
        if (user && user.tipo) {
            return this.normalizeRole(user.tipo);
        }
        
        if (user && user.type) {
            return this.normalizeRole(user.type);
        }
        
        const storedType = localStorage.getItem('userType');
        if (storedType) {
            return this.normalizeRole(storedType);
        }
        
        if (user && user.sourceTable) {
            if (user.sourceTable === 'empresas') return 'empresa';
            if (user.sourceTable === 'instituicoes') return 'instituicao';
            if (user.sourceTable === 'usuarios') {
                if (user.tipo === 'admin' || user.type === 'admin') return 'admin';
                return 'coordenador';
            }
        }
        
        return 'instituicao';
    },

    getHomeUrl(role = this.getCurrentRole()) {
        const normalizedRole = this.normalizeRole(role);
        
        const routes = {
            empresa: 'empresaDashboard.html',
            instituicao: 'tela-inicial-instituicao.html',
            coordenador: 'tela-inicial-coordenador.html',
            admin: 'tela-admin.html'
        };
        
        return routes[normalizedRole] || routes.instituicao;
    },

    getNotificationsUrl() {
        return 'notificacoes.html';
    },

    getProposalsUrl(role = this.getCurrentRole()) {
        const normalizedRole = this.normalizeRole(role);
        
        const routes = {
            empresa: 'propostas.html',
            instituicao: 'tela-propostas-instituicao.html',
            coordenador: 'tela-propostas-coordenador.html',
            admin: 'tela-admin.html'
        };
        
        return routes[normalizedRole] || routes.instituicao;
    },

    go(url) {
        window.location.href = url;
    }
};

window.getIdFromQuery = function() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
};

window.getStatusLabel = function(status) {
    const value = String(status || '').toLowerCase();
    if (!value) return '';
    if (value.includes('aceit') || value.includes('aprov')) return 'Aprovada';
    if (value.includes('reje') || value.includes('reprov')) return 'Rejeitada';
    if (value.includes('pend') || value.includes('anal')) return 'Pendente';
    return status;
};

window.checkAuth = function() {
    if (window.StorageManager && !window.StorageManager.getToken()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
};

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

window.loadDesafio = async function(id) {
    try {
        if (id) {
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
            const lista = await window.ApiClient.get('/me/desafios');
            return (lista && lista[0]) ? lista[0] : {};
        }
    } catch (e) {
        console.error('Erro ao carregar desafio:', e);
        return {};
    }
};

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

// API_BASE_URL é definido em config.js e exportado para window.API_BASE_URL
const API_BASE_URL = window.API_BASE_URL;

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
    
    setUser(user, sourceTable) {
        try {
            console.log('SetUser - Recebido user:', user);
            console.log('SetUser - sourceTable recebido:', sourceTable);
            
            const copy = {};
            
            if (user && user.email) {
                copy.email = user.email;
            }
            
            let source = null;
            let role = null;
            
            if (sourceTable === 'instituicoes') {
                source = 'instituicoes';
                role = 'instituicao';
                if (user && user.nomeinstituicao) copy.nomeinstituicao = user.nomeinstituicao;
            } else if (sourceTable === 'empresas') {
                source = 'empresas';
                role = 'empresa';
                if (user && user.nomefantasia) copy.nomefantasia = user.nomefantasia;
            } else if (sourceTable === 'usuarios') {
                source = 'usuarios';
                role = user?.tipo === 'admin' ? 'admin' : 'coordenador';
                if (user && user.nome) copy.nome = user.nome;
            } else if (user && user.tipo === 'instituicao') {
                source = 'instituicoes';
                role = 'instituicao';
                if (user.nomeinstituicao) copy.nomeinstituicao = user.nomeinstituicao;
            } else if (user && user.tipo === 'empresa') {
                source = 'empresas';
                role = 'empresa';
                if (user.nomefantasia) copy.nomefantasia = user.nomefantasia;
            } else if (user && user.nomeinstituicao) {
                source = 'instituicoes';
                role = 'instituicao';
                copy.nomeinstituicao = user.nomeinstituicao;
            } else if (user && user.nomefantasia) {
                source = 'empresas';
                role = 'empresa';
                copy.nomefantasia = user.nomefantasia;
            } else if (user && user.nome) {
                source = 'usuarios';
                role = 'coordenador';
                copy.nome = user.nome;
            } else {
                source = 'instituicoes';
                role = 'instituicao';
            }
            
            copy.sourceTable = source;
            copy.tipo = role;
            copy.type = role;
            
            localStorage.removeItem('auth_user');
            localStorage.removeItem('userType');
            localStorage.removeItem('userSource');
            
            localStorage.setItem('auth_user', JSON.stringify(copy));
            localStorage.setItem('userType', role);
            localStorage.setItem('userSource', source);
            
            console.log('SetUser - Salvou:', { source, role, email: copy.email });
            
        } catch (e) {
            console.error('Erro ao salvar usuario:', e);
        }
    },
    
    getUser() {
        const user = localStorage.getItem('auth_user');
        if (!user) return null;
        try {
            return JSON.parse(user);
        } catch (e) {
            return null;
        }
    },
    
    getUserName() {
        const user = this.getUser();
        if (!user) return 'Entrar';
        
        if (user.nomefantasia) return user.nomefantasia;
        if (user.nomeinstituicao) return user.nomeinstituicao;
        if (user.nome) return user.nome;
        
        return user.email || 'Usuario';
    },
    
    logout() {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('userType');
        localStorage.removeItem('userSource');
        window.location.href = 'login.html';
    }
};

// Função auxiliar para obter nome específico do usuário baseado no tipo
window.getUserSpecificName = function(user = null) {
    const userData = user || StorageManager.getUser();
    if (!userData) return 'Usuário';
    
    const role = AppRoutes.getCurrentRole();
    
    switch(role) {
        case 'empresa':
            return userData.nomefantasia || 
                   userData.nomeFantasia || 
                   userData.fantasia || 
                   userData.razaosocial || 
                   userData.razaoSocial || 
                   userData.nome || 
                   userData.name || 
                   'Empresa';
            
        case 'instituicao':
            return userData.nomeinstituicao || 
                   userData.nomeInstituicao || 
                   userData.nome_instituicao || 
                   userData.instituicaoNome || 
                   userData.instituicao || 
                   userData.nome || 
                   userData.name || 
                   'Instituição';
            
        case 'coordenador':
            return userData.nome || userData.name || 'Coordenador';
            
        case 'admin':
            return userData.nome || userData.name || userData.email || 'Administrador';
            
        default:
            return userData.nome || userData.name || 'Usuário';
    }
};

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

function ensureRole(allowedRoles) {
    if (!Array.isArray(allowedRoles)) {
        allowedRoles = [allowedRoles];
    }
    
    const token = StorageManager.getToken();
    if (!token) {
        window.location.href = 'login.html';
        return false;
    }
    
    const user = StorageManager.getUser();
    let currentRole = null;
    
    if (user && user.tipo) {
        currentRole = user.tipo;
    } else if (user && user.type) {
        currentRole = user.type;
    } else {
        currentRole = localStorage.getItem('userType');
    }
    
    currentRole = AppRoutes.normalizeRole(currentRole);
    
    console.log('ensureRole - Role atual:', currentRole);
    console.log('ensureRole - Roles permitidas:', allowedRoles);
    
    // ADMIN TEM ACESSO A TUDO
    if (currentRole === 'admin') {
        console.log('ensureRole - Admin tem acesso permitido');
        return true;
    }
    
    if (allowedRoles.includes(currentRole)) {
        console.log('ensureRole - Acesso permitido');
        return true;
    }
    
    const homeUrl = AppRoutes.getHomeUrl(currentRole);
    console.log('ensureRole - Acesso negado, redirecionando para:', homeUrl);
    window.location.href = homeUrl;
    return false;
}

function checkPageAccess() {
    return window.validatePageAccess ? window.validatePageAccess() : true;
}

window.resolveUserDisplay = function(user) {
    try {
        const u = user || StorageManager.getUser() || {};
        
        let source = u.sourceTable || localStorage.getItem('userSource');
        let name = '';
        let role = '';
        let roleLabel = '';
        
        if (source === 'empresas') {
            name = u.nomefantasia || u.nomeFantasia || u.razaosocial || u.email || 'Empresa';
            role = 'empresa';
            roleLabel = 'Empresa';
        } else if (source === 'instituicoes') {
            name = u.nomeinstituicao || u.nomeInstituicao || u.instituicao || u.email || 'Instituicao';
            role = 'instituicao';
            roleLabel = 'Instituicao';
        } else if (source === 'usuarios') {
            name = u.nome || u.name || u.email || 'Usuario';
            if (u.tipo === 'admin' || u.type === 'admin') {
                role = 'admin';
                roleLabel = 'Administrador';
            } else {
                role = 'coordenador';
                roleLabel = 'Coordenador';
            }
        } else {
            name = u.email || 'Usuario';
            role = 'instituicao';
            roleLabel = 'Instituicao';
        }
        
        return { name, role, roleLabel, source };
        
    } catch (e) {
        console.error('Erro no resolveUserDisplay:', e);
        return { name: 'Usuario', role: 'instituicao', roleLabel: 'Instituicao', source: 'usuarios' };
    }
};

if (typeof window !== 'undefined') {
    window.StorageManager = StorageManager;
    window.ApiClient = ApiClient;
    window.AppRoutes = AppRoutes;
    window.NavBar = NavBar;
    window.SideNav = SideNav;
    window.buildSideNavItems = buildSideNavItems;
    window.mountVuePage = mountVuePage;
    window.resolveUserDisplay = resolveUserDisplay;
    window.FormInput = FormInput;
    window.ProposalCard = ProposalCard;
    window.ChallengeCard = ChallengeCard;
    window.ProblemCard = ProblemCard;
    window.ValidationFunctions = ValidationFunctions;
    window.mountStandardApp = mountStandardApp;
    window.ensureRole = ensureRole;
    window.checkPageAccess = checkPageAccess;
}

(function(){
    try{
        function refreshNavUser(){
            const nameEl = document.getElementById('navUserName');
            const logoutBtn = document.getElementById('navLogoutBtn');
            if(!nameEl && !logoutBtn) return;
            const user = StorageManager.getUser();
            if(user){
                try {
                    const info = window.resolveUserDisplay(user);
                    if(nameEl) nameEl.textContent = info.name || 'Usuário';
                    if(logoutBtn) logoutBtn.style.display = 'inline-block';
                } catch (e) {
                    if(nameEl) nameEl.textContent = 'Usuário';
                    if(logoutBtn) logoutBtn.style.display = 'inline-block';
                }
            } else {
                if(nameEl) nameEl.textContent = 'Entrar';
                if(logoutBtn) logoutBtn.style.display = 'none';
            }
        }

        window.refreshNavUser = refreshNavUser;

        window.hasAccess = function(pageName, role) {
            try {
                const accessControl = window.ACCESS_CONTROL;
                if (!accessControl || !accessControl.pages) return false;
                
                const pageRoles = accessControl.pages[pageName];
                if (!pageRoles) return false; 
                
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
                window.location.href = AppRoutes.getHomeUrl(role);
                return false;
            }
            return true;
        };

        setTimeout(refreshNavUser, 50);
        window.addEventListener('storage', refreshNavUser);
    }catch(e){
        console.warn('Auth UI helpers init failed', e);
    }
})();

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

    const publicMenu = [
        { label: 'Início', href: 'index.html' },
        { label: 'Login', href: 'login.html' },
        { label: 'Cadastro Empresa', href: 'CadastroEmpresa.html' },
        { label: 'Cadastro Instituição', href: 'CadastroInstituicao.html' }
    ];

    function normalizeMenu(menu){
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
                if(copy.href && seen.has(copy.href)){
                    delete copy.href;
                }
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

    return normalizeMenu(publicMenu);
};

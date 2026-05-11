// Commons - Componentes e Funções Compartilhadas

// Componente de Navegação
const NavBar = {
    template: `
    <nav class="bg-slate-950 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center gap-3 cursor-pointer" onclick="window.location.href='index.html'">
                    <div class="text-2xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                        Desafios
                    </div>
                </div>
                <div class="hidden md:flex gap-1">
                    <a href="index.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">Início</a>
                    <a href="dashboard.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">Dashboard</a>
                    <a href="cadastroEmpresa.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">Empresa</a>
                    <a href="cadastroInstituicao.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">Instituição</a>
                    <a href="recuperaSenha.html" class="px-4 py-2 rounded-lg font-medium transition-all text-gray-300 hover:bg-slate-800">Recuperar senha</a>
                </div>
                <div class="md:hidden">
                    <button class="text-gray-300 hover:text-white">Menu</button>
                </div>
            </div>
        </div>
    </nav>
    `
};

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

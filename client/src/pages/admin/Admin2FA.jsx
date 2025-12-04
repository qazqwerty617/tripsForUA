import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react'
import { Helmet } from 'react-helmet-async'
import api from '../../utils/api'
import toast from 'react-hot-toast'

export default function Admin2FA() {
    const [status, setStatus] = useState({ enabled: false, loading: true })
    const [setupData, setSetupData] = useState(null)
    const [verifyCode, setVerifyCode] = useState('')
    const [disableCode, setDisableCode] = useState('')
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetchStatus()
    }, [])

    const fetchStatus = async () => {
        try {
            const res = await api.get('/auth/2fa/status')
            setStatus({ enabled: res.data.enabled, loading: false })
        } catch (error) {
            toast.error('Помилка завантаження статусу 2FA')
            setStatus({ enabled: false, loading: false })
        }
    }

    const handleSetup = async () => {
        setLoading(true)
        try {
            const res = await api.post('/auth/2fa/setup')
            setSetupData(res.data)
        } catch (error) {
            toast.error(error.response?.data?.message || 'Помилка налаштування 2FA')
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await api.post('/auth/2fa/verify', { token: verifyCode })
            toast.success('2FA успішно увімкнено!')
            setSetupData(null)
            setVerifyCode('')
            fetchStatus()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Невірний код')
        } finally {
            setLoading(false)
        }
    }

    const handleDisable = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await api.post('/auth/2fa/disable', { token: disableCode })
            toast.success('2FA вимкнено')
            setDisableCode('')
            fetchStatus()
        } catch (error) {
            toast.error(error.response?.data?.message || 'Невірний код')
        } finally {
            setLoading(false)
        }
    }

    if (status.loading) {
        return (
            <div className="min-h-screen bg-luxury-dark flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-luxury-gold animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-luxury-dark">
            <Helmet>
                <meta name="robots" content="noindex, nofollow" />
                <title>2FA Settings - Admin Panel</title>
            </Helmet>

            <div className="bg-luxury-dark-card border-b border-luxury-gold/20 py-6">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <Link to="/mng-x7k9p2-secure" className="text-luxury-gold hover:text-luxury-gold-light inline-flex items-center mb-4">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Назад
                    </Link>
                    <h1 className="text-3xl font-bold text-luxury-gold flex items-center gap-3">
                        <Shield className="h-8 w-8" />
                        Двофакторна автентифікація
                    </h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-luxury-dark-card rounded-xl border border-luxury-gold/20 p-6">
                    {/* Current Status */}
                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-luxury-gold/10">
                        <div className="flex items-center gap-3">
                            {status.enabled ? (
                                <ShieldCheck className="h-8 w-8 text-green-500" />
                            ) : (
                                <ShieldOff className="h-8 w-8 text-red-500" />
                            )}
                            <div>
                                <h3 className="text-lg font-semibold text-white">
                                    Статус: {status.enabled ? 'Увімкнено' : 'Вимкнено'}
                                </h3>
                                <p className="text-sm text-gray-400">
                                    {status.enabled
                                        ? 'Ваш акаунт захищений двофакторною автентифікацією'
                                        : 'Рекомендуємо увімкнути для додаткового захисту'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Enable 2FA */}
                    {!status.enabled && !setupData && (
                        <div className="text-center py-6">
                            <p className="text-gray-300 mb-6">
                                Для налаштування 2FA вам знадобиться додаток автентифікації:
                                <br />
                                <span className="text-luxury-gold">Google Authenticator</span> або <span className="text-luxury-gold">Authy</span>
                            </p>
                            <button
                                onClick={handleSetup}
                                disabled={loading}
                                className="bg-luxury-gold text-luxury-dark px-6 py-3 rounded-lg font-semibold hover:bg-luxury-gold-light transition disabled:opacity-50"
                            >
                                {loading ? 'Завантаження...' : 'Налаштувати 2FA'}
                            </button>
                        </div>
                    )}

                    {/* QR Code Setup */}
                    {setupData && (
                        <div className="text-center py-6">
                            <h3 className="text-xl font-semibold text-white mb-4">Скануйте QR-код</h3>
                            <p className="text-gray-400 mb-4">
                                Відкрийте додаток автентифікації та скануйте цей код
                            </p>
                            <div className="bg-white p-4 rounded-xl inline-block mb-6">
                                <img src={setupData.qrCode} alt="2FA QR Code" className="w-48 h-48" />
                            </div>
                            <div className="bg-luxury-dark/50 rounded-lg p-4 mb-6">
                                <p className="text-sm text-gray-400 mb-2">Або введіть код вручну:</p>
                                <code className="text-luxury-gold font-mono text-sm break-all">
                                    {setupData.secret}
                                </code>
                            </div>
                            <form onSubmit={handleVerify} className="max-w-xs mx-auto">
                                <label className="block text-sm text-gray-400 mb-2">
                                    Введіть 6-значний код з додатку
                                </label>
                                <input
                                    type="text"
                                    maxLength={6}
                                    pattern="[0-9]{6}"
                                    value={verifyCode}
                                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-full px-4 py-3 bg-luxury-dark border border-luxury-gold/30 text-white rounded-lg text-center text-2xl tracking-widest mb-4"
                                    placeholder="000000"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading || verifyCode.length !== 6}
                                    className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-500 transition disabled:opacity-50"
                                >
                                    {loading ? 'Перевірка...' : 'Підтвердити та увімкнути'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setSetupData(null)}
                                    className="w-full mt-2 text-gray-400 hover:text-white py-2"
                                >
                                    Скасувати
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Disable 2FA */}
                    {status.enabled && (
                        <div className="py-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Вимкнути 2FA</h3>
                            <p className="text-gray-400 mb-4">
                                Для вимкнення 2FA введіть поточний код з додатку автентифікації
                            </p>
                            <form onSubmit={handleDisable} className="max-w-xs">
                                <input
                                    type="text"
                                    maxLength={6}
                                    pattern="[0-9]{6}"
                                    value={disableCode}
                                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                                    className="w-full px-4 py-3 bg-luxury-dark border border-luxury-gold/30 text-white rounded-lg text-center text-2xl tracking-widest mb-4"
                                    placeholder="000000"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={loading || disableCode.length !== 6}
                                    className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-500 transition disabled:opacity-50"
                                >
                                    {loading ? 'Вимикання...' : 'Вимкнути 2FA'}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Sistema de verificación de código con bloqueo progresivo
const CORRECT_CODE = "123456"
const MAX_ATTEMPTS = 5
const INITIAL_LOCK_TIME = 30 // segundos

class CodeVerification {
  constructor() {
    this.inputs = document.querySelectorAll(".code-input")
    this.errorMessage = document.getElementById("error-message")
    this.lockMessage = document.getElementById("lock-message")
    this.attemptsCounter = document.getElementById("attempts-counter")

    // Estado del sistema
    this.failedAttempts = Number.parseInt(localStorage.getItem("failedAttempts") || "0")
    this.lockCount = Number.parseInt(localStorage.getItem("lockCount") || "0")
    this.lockUntil = Number.parseInt(localStorage.getItem("lockUntil") || "0")
    this.remainingAttempts = MAX_ATTEMPTS - this.failedAttempts

    this.init()
  }

  init() {
    // Verificar si está bloqueado
    if (this.isLocked()) {
      this.showLockMessage()
      this.startLockTimer()
      return
    }

    // Configurar eventos de los inputs
    this.inputs.forEach((input, index) => {
      input.addEventListener("input", (e) => this.handleInput(e, index))
      input.addEventListener("keydown", (e) => this.handleKeyDown(e, index))
      input.addEventListener("paste", (e) => this.handlePaste(e))
    })

    // Enfocar el primer input
    this.inputs[0].focus()
    this.updateAttemptsCounter()
  }

  handleInput(e, index) {
    const value = e.target.value

    // Solo permitir números
    if (!/^\d$/.test(value)) {
      e.target.value = ""
      return
    }

    // Mover al siguiente input
    if (value && index < this.inputs.length - 1) {
      this.inputs[index + 1].focus()
    }

    // Verificar si se completó el código
    if (index === this.inputs.length - 1 && value) {
      this.verifyCode()
    }
  }

  handleKeyDown(e, index) {
    // Retroceso: mover al input anterior
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      this.inputs[index - 1].focus()
    }

    // Flecha izquierda
    if (e.key === "ArrowLeft" && index > 0) {
      this.inputs[index - 1].focus()
    }

    // Flecha derecha
    if (e.key === "ArrowRight" && index < this.inputs.length - 1) {
      this.inputs[index + 1].focus()
    }
  }

  handlePaste(e) {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim()

    // Verificar que sean 6 dígitos
    if (/^\d{6}$/.test(pastedData)) {
      pastedData.split("").forEach((digit, index) => {
        if (this.inputs[index]) {
          this.inputs[index].value = digit
        }
      })
      this.verifyCode()
    }
  }

  getCode() {
    return Array.from(this.inputs)
      .map((input) => input.value)
      .join("")
  }

  verifyCode() {
    const code = this.getCode()

    console.log("[v0] Verificando código:", code)

    if (code === CORRECT_CODE) {
      this.handleSuccess()
    } else {
      this.handleFailure()
    }
  }

  handleSuccess() {
    console.log("[v0] Código correcto - redirigiendo")

    // Limpiar intentos fallidos
    localStorage.removeItem("failedAttempts")
    localStorage.removeItem("lockCount")
    localStorage.removeItem("lockUntil")

    // Animación de éxito
    this.inputs.forEach((input) => {
      input.classList.add("success")
      input.disabled = true
    })

    // Redireccionar después de una breve pausa
    setTimeout(() => {
      window.location.href = "/ficha"
    }, 500)
  }

  handleFailure() {
    this.failedAttempts++
    this.remainingAttempts = MAX_ATTEMPTS - this.failedAttempts

    console.log("[v0] Código incorrecto - Intentos fallidos:", this.failedAttempts)

    // Guardar intentos fallidos
    localStorage.setItem("failedAttempts", this.failedAttempts.toString())

    // Animación de error
    this.inputs.forEach((input) => {
      input.classList.add("error")
      input.value = ""
    })

    setTimeout(() => {
      this.inputs.forEach((input) => input.classList.remove("error"))
    }, 400)

    // Verificar si se alcanzó el límite de intentos
    if (this.failedAttempts >= MAX_ATTEMPTS) {
      this.lockSystem()
    } else {
      this.showError(`Código incorrecto. Te quedan ${this.remainingAttempts} intentos.`)
      this.updateAttemptsCounter()
      this.inputs[0].focus()
    }
  }

  lockSystem() {
    this.lockCount++
    const lockDuration = this.calculateLockDuration()
    this.lockUntil = Date.now() + lockDuration * 1000

    console.log("[v0] Sistema bloqueado por", lockDuration, "segundos")

    // Guardar estado de bloqueo
    localStorage.setItem("lockCount", this.lockCount.toString())
    localStorage.setItem("lockUntil", this.lockUntil.toString())
    localStorage.setItem("failedAttempts", "0")

    // Deshabilitar inputs
    this.disableInputs()
    this.showLockMessage()
    this.startLockTimer()
  }

  calculateLockDuration() {
    // Bloqueo progresivo: 30s, 60s, 120s, 240s, etc.
    return INITIAL_LOCK_TIME * Math.pow(2, this.lockCount - 1)
  }

  isLocked() {
    return Date.now() < this.lockUntil
  }

  disableInputs() {
    this.inputs.forEach((input) => {
      input.disabled = true
      input.value = ""
    })
  }

  enableInputs() {
    this.inputs.forEach((input) => {
      input.disabled = false
    })
    this.inputs[0].focus()
  }

  showError(message) {
    this.errorMessage.textContent = message
    this.errorMessage.classList.remove("hidden")

    setTimeout(() => {
      this.errorMessage.classList.add("hidden")
    }, 3000)
  }

  showLockMessage() {
    const remainingTime = Math.ceil((this.lockUntil - Date.now()) / 1000)
    this.lockMessage.textContent = `Sistema bloqueado. Espera ${this.formatTime(remainingTime)}`
    this.lockMessage.classList.remove("hidden")
    this.errorMessage.classList.add("hidden")
  }

  startLockTimer() {
    const timer = setInterval(() => {
      if (!this.isLocked()) {
        clearInterval(timer)
        this.unlockSystem()
      } else {
        const remainingTime = Math.ceil((this.lockUntil - Date.now()) / 1000)
        this.lockMessage.textContent = `Sistema bloqueado. Espera ${this.formatTime(remainingTime)}`
      }
    }, 1000)
  }

  unlockSystem() {
    console.log("[v0] Sistema desbloqueado")

    this.failedAttempts = 0
    this.remainingAttempts = MAX_ATTEMPTS
    localStorage.setItem("failedAttempts", "0")

    this.lockMessage.classList.add("hidden")
    this.enableInputs()
    this.updateAttemptsCounter()
  }

  updateAttemptsCounter() {
    this.attemptsCounter.textContent = `Intentos restantes: ${this.remainingAttempts}`
  }

  formatTime(seconds) {
    if (seconds < 60) {
      return `${seconds} segundos`
    } else {
      const minutes = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${minutes}:${secs.toString().padStart(2, "0")} minutos`
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new CodeVerification()
})

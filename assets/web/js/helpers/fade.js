export const FADE_IN_ANIMATION_DURATION = 500
export const FADE_OUT_ANIMATION_DURATION = 500

export function fadeIn(element) {
    element.style.display = ''
    setTimeout(() => {
        element.classList.add('fade-in')
    }, 1)
    setTimeout(() => {
        element.classList.remove('fade-in')
    }, FADE_IN_ANIMATION_DURATION)
}

export function fadeOut(element) {
    element.classList.add('fade-out')
    setTimeout(() => {
        element.classList.remove('fade-out')
        element.style.display = 'none'
    }, FADE_OUT_ANIMATION_DURATION)
}
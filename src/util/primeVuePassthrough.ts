export const primeVuePassthrough = {
    dialog: {
        root: {
            class: 'w-5/10 h-8/10'
        },
        content: {
            class: 'h-full'
        }
    },
    button: {
        root: ({ props }) => {
            if (props.variant === 'link') {
                return {
                    class: 'cursor-pointer'
                }
            }
        }
    }
}
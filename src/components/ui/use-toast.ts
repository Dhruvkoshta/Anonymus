import * as React from "react"

import { Toaster, Toast, ToastAction } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactElement<typeof ToastAction>
  // runtime controlled fields
  open?: boolean
  duration?: number
} & (
  | { variant: "default" }
  | { variant: "destructive" }
)

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

type Action = // This is the part that was missing
  | { type: typeof actionTypes.ADD_TOAST; toast: ToasterToast }
  | { type: typeof actionTypes.UPDATE_TOAST; toast: Partial<ToasterToast> }
  | { type: typeof actionTypes.DISMISS_TOAST; toastId?: ToasterToast["id"] }
  | { type: typeof actionTypes.REMOVE_TOAST; toastId?: ToasterToast["id"] }

interface State {
  toasts: ToasterToast[]
}

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ADD_TOAST:
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case actionTypes.UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.DISMISS_TOAST:
      const { toastId } = action

      // ! Side effects ! - This is not typical in a reducer, but we need to expose
      // a way to update whether a toast is open or not to the DOM.
      if (toastId) {
        return {
          ...state,
          toasts: state.toasts.map((t) =>
            t.id === toastId ? { ...t, open: false } : t
          ),
        }
      } else {
        return {
          ...state,
          toasts: state.toasts.map((t) => ({ ...t, open: false })),
        }
      }
    case actionTypes.REMOVE_TOAST:
      if (action.toastId) {
        return {
          ...state,
          toasts: state.toasts.filter((t) => t.id !== action.toastId),
        }
      }
      return state
  }
}

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

// Allow callers to omit id and variant; we'll generate id and default variant.
type ToastOptions = Omit<ToasterToast, "id" | "variant"> & {
  id?: string
  variant?: "default" | "destructive"
  // duration is used in effect but not part of base type; make it optional here
  duration?: number
}

function useToast() {
  const [state, dispatch] = React.useReducer(reducer, { toasts: [] })

  React.useEffect(() => {
    state.toasts.forEach((toast) => {
      if (toast.open === false) {
        if (toast.duration) {
          setTimeout(() => {
            dispatch({ type: "REMOVE_TOAST", toastId: toast.id })
          }, toast.duration)
        } else {
          setTimeout(() => {
            dispatch({ type: "REMOVE_TOAST", toastId: toast.id })
          }, TOAST_REMOVE_DELAY)
        }
      }
    })
  }, [state.toasts])

  const toast = React.useCallback((props: ToastOptions) => {
    const id = props.id ?? genId()
    const variant = props.variant ?? "default"

    // include open flag for reducer control; coerce to ToasterToast shape with required fields
    dispatch({ type: "ADD_TOAST", toast: { ...props, id, variant, open: true } as unknown as ToasterToast })

    return { id }
  }, [])

  return { ...state, toast }
}

export { useToast, Toast, Toaster }
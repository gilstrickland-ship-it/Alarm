import Toast from "react-native-toast-message";

export function showSuccess(message, title = "Success") {
  Toast.show({
    type: "success",
    text1: title,
    text2: message,
    visibilityTime: 3000,
  });
}

export function showError(message, title = "Error") {
  Toast.show({
    type: "error",
    text1: title,
    text2: message,
    visibilityTime: 4000,
  });
}

export function showInfo(message, title) {
  Toast.show({
    type: "info",
    text1: title || "",
    text2: message,
    visibilityTime: 3000,
  });
}

/**
 * Show a confirmation toast with Cancel and Confirm buttons.
 * @param {string} message - The confirmation message
 * @param {Object} options - { onConfirm, onCancel, confirmText, cancelText, destructive }
 */
export function showConfirmation(message, options = {}) {
  const {
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    destructive = false,
  } = options;

  Toast.show({
    type: "confirmation",
    text1: message,
    visibilityTime: 0,
    autoHide: false,
    props: {
      onConfirm: onConfirm || (() => {}),
      onCancel: onCancel || (() => {}),
      confirmText,
      cancelText,
      destructive,
    },
  });
}

export function hide() {
  Toast.hide();
}

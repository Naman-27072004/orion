; ===============================================================================
; Orion Installer Custom NSIS Script Hooks
; ===============================================================================

!macro NSIS_HOOK_PREINSTALL
  DetailPrint "Preparing system environment for Orion Intelligence Platform..."
!macroend

!macro NSIS_HOOK_POSTINSTALL
  DetailPrint "Configuring desktop shortcuts and application registry settings..."
  ; Ensure current user permissions and shortcuts are cleanly written
!macroend

!macro NSIS_HOOK_UNINSTALL_PRE
  DetailPrint "Cleaning up Orion cached data and configuration..."
!macroend

!macro NSIS_HOOK_UNINSTALL_POST
  DetailPrint "Orion Intelligence Platform uninstallation complete."
!macroend

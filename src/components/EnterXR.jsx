import { VRButton } from '@react-three/xr'

export default function EnterXR({ store }) {
  return (
    <div className="pointer-events-auto">
      {/*
        XR-specific decision:
        - Use VRButton from @react-three/xr so session lifecycle is handled by the library.
        - This @react-three/xr version requires an XR store; VRButton reads session state via zustand.
      */}
      <VRButton
        store={store}
        className="rounded bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/15"
        onError={(e) => console.error(e)}
      >
        {(status) =>
          status === 'entered'
            ? 'Exit XR'
            : status === 'exited'
              ? 'Enter XR'
              : 'XR Unsupported'
        }
      </VRButton>
    </div>
  )
}

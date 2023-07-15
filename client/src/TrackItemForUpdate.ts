import { useSyncState } from "./store/useSyncState";
import { storeToRefs } from "pinia";
import { useDocumentCache } from "./store/useDocumentCache";
import { useSheetManager } from "./store/useSheetManager";
import { watch, onUnmounted } from "vue";
import type { Ref } from "vue";
import type { SheetItem } from "./SheetTypes";
import type { Panel } from "./Panels";

const updateDebounceMs = 2_000

export function useUpdateItem(item: Ref<SheetItem>, panelObject?: Panel) {
  const { updateItem, removeItemFromCacheBySysId } = useDocumentCache();
  const { setProcessing } = useSyncState();
  const { processing } = storeToRefs(useSyncState());
  const { getActivePanel } = storeToRefs(useSheetManager());

  const panel = panelObject ?? getActivePanel.value

  let timeout = setTimeout(() => { }, 0)
  let currentItem = ''
  watch(item, async (newItem, oldItem) => {
    // user has reverted the item back to its original state
    if (JSON.stringify(newItem) === currentItem) {
      clearTimeout(timeout)
      setProcessing(false)
      return
    }

    // user just selected this item
    if (!oldItem) {
      return
    }

    setProcessing(true)
    clearTimeout(timeout)
    timeout = setTimeout(() => {
      updateItem({
        item: newItem,
        panel,
      })
      currentItem = JSON.stringify(newItem)
    }, updateDebounceMs);
  }, { deep: true, immediate: true })

  onUnmounted(() => {
    // no row # means it's a new item that has never hit the server
    if (item.value && typeof item.value?.row !== 'number' && !processing.value) {
      const { sysId } = item.value
      removeItemFromCacheBySysId(sysId, panel)
    }
  })

  const forceUpdate = () => {
    updateItem({
      item: item.value,
      panel,
    })
  }

  return {
    forceUpdate
  }
}
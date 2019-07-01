import { RenderContext } from 'vue/types/option'

// hopefully this can be passed in as this from the caller?
export function renderScopedIfPossible(slotName: string, scopedSlots: any, slots: any, data: any) {
	if (scopedSlots[slotName])
		scopedSlots[slotName](data)
	else
		slots[slotName]
}

<template>
    <div class="root" ref="root">
      <div class="downwarp"
        ref="downwarp"
        :class="{ 'pull-top-animation': state.pullAnimationMove }"
        :style="{ height: `${state.pullDistance}px` }"
        @transitionend="transitionEnd"
        >
        <slot name="pullDown">
          <div class="downwarp-content">
            <p class="downwarp-progress"
              :class="{ 'rotate': state.pullStatus === 'loading' }"
              :style="{ transform: `rotate(${pullDownRotate}deg)` }"
            ></p>
            <p class="downwarp-tip">{{ pullDownTipsText }}</p>
          </div>
        </slot>
      </div>
      <div class="virtual-list-view" ref="viewport"
        @scroll="fnScroll"
        >
          <!--scroll bar occupation-->
          <div class='virtual-list-view-phantom' :style="{height: contentHeight}"></div>
          <!--visable area-->
          <div class="virtual-list-view-content" ref="content">
            <div ref="items">
              <div 
                v-for="(item) in state.visibleDataList"
                :key="item[uniqueKey]"
              >
                <slot name="item" :data="item" ></slot>
              </div>
              <div 
                v-for="(item) in state.unVisibleDataPoolList"
                :key="item[uniqueKey]"
                class="item-invisible"
              >
                <slot name="item" :data="item"></slot>
              </div>
            </div>
            <slot name="footer"></slot>
          </div>
      </div>
    </div>
  </template>

<script setup lang="ts">
import { rAFthrottle } from '../../framework/utils/rAFthrottle';
import ResizeObserver from 'resize-observer-polyfill';
import { computed, onMounted, reactive, Ref, ref, watch, onBeforeUnmount, nextTick } from 'vue';
import { booleanLiteralTypeAnnotation } from '@babel/types';

const PULL_DOWN_STATUS = {
    none: 'none',
    canLoading: 'canLoading',
    loading: 'loading'
};
const UP_DOWN_STATUS = {
    none: 'none',
    loading: 'loading'
};

const props = defineProps({
    estimatedItemHeight: {
        type: Number,
        default: 68
    },
    itemList: {
        type: Array,
        required: false,
        default() {
            return []
        }
    },
    hasMore: {
        type: Boolean,
        default: false
    },
    runawayItems: {
        type: Number,
        default: 5
    },
    opsrunawayItems: {
        type: Number,
        default: 5
    },
    loadawayItems: {
        type: Number,
        default: 10
    },
    uniqueKey: {
        type: String,
        default: 'id'
    },
    usePullDownRefresh: {
        type: Boolean,
        default: false
    },
    pullDownOffset: {
        type: Number,
        default: 80
    },
    pullDownTips: {
        type: String,
        default: 'Pull to refresh'
    },
    pullDownReleaseTips: {
        type: String,
        default: 'Release to refresh'
    },
    pullDownLoadingTips: {
        type: String,
        default: 'Loading'
    },
    nestBottom: {
        type: Boolean,
        default: false,
    }
});

const emit = defineEmits(['loadmore', 'refresh']);

const state = reactive<{
    poolSize: number;
    maxPageSize: number;
    visibleDataList: any[];
    unVisibleDataPoolList: any[];
    lastScollerTop: number;
    nodesItemArr: any[];
    curAncharItem: {
        index: number;
        offset: number;
    };
    screenHeight: number;
    scrollHeight: number;
    // properties for pull down refresh or load more
    upStatus: string;
    pullDistance: number;
    pullStatus: string;
    pullAnimationMove: boolean;
    startHeight: number;
    startScroll: number;
}>({
    poolSize: 0, // pool size of item in list, auto calculated
    maxPageSize: 0, // max item count on a screen,  auto calculated
    visibleDataList: [],
    unVisibleDataPoolList: [],
    lastScollerTop:0,
    nodesItemArr:[],
    curAncharItem: {
        index: 0,
        offset: 0
    },
    screenHeight: 0,
    scrollHeight: 0,
    // properties for pull down refresh or load more
    upStatus: UP_DOWN_STATUS.none,
    pullDistance: 0,
    pullStatus: PULL_DOWN_STATUS.none,
    pullAnimationMove: false,
    startHeight: 0,
    startScroll: 0,

});

let forceUpdate = true;
let needMeasureItems = false;
let ro: ResizeObserver;
let touchStartPoint: {
    startX: number;
    startY: number;
} | undefined;
let lastMovePoint = touchStartPoint;

const viewport: Ref<HTMLElement | undefined> = ref();
const items: Ref<HTMLElement | undefined> = ref();
const content: Ref<HTMLElement | undefined> = ref();
const root: Ref<HTMLElement | undefined> = ref();
const downwarp: Ref<HTMLElement | undefined> = ref();

const contentHeight = computed(() => {
    return `${state.scrollHeight}px`;
});
const visibleCount = computed(() => {
    return Math.ceil(state.screenHeight / props.estimatedItemHeight);
});
const pullDownRotate = computed(() => {
    return state.pullDistance / props.pullDownOffset * 720;
});
const pullDownTipsText = computed(() => {
    const status = state.pullStatus;
      if (status === PULL_DOWN_STATUS.canLoading) {
        return props.pullDownReleaseTips;
      } else if (status === PULL_DOWN_STATUS.loading) {
        return props.pullDownLoadingTips;
      }
      return props.pullDownTips;
});
const onListScroll = () => {
      if (state.pullDistance) {
        return;
      }
      const force = forceUpdate || false;
      const scrollTop = viewport.value?.scrollTop || 0;
      const delta = scrollTop - state.lastScollerTop;
      if (needMeasureItems) {
        onMeasureItems(items.value?.children);
      }
      const ancharItem = calculateAnchoredItem(state.curAncharItem, delta);
      const lastAncharItem = calculateAnchoredItem(ancharItem, state.screenHeight);
      updateVisableData(scrollTop, ancharItem, lastAncharItem, force);
      state.curAncharItem = ancharItem;
      state.lastScollerTop = scrollTop;
      // loadmore
      if( props.itemList.length 
          && lastAncharItem.index + props.loadawayItems > props.itemList.length 
          && state.upStatus !== UP_DOWN_STATUS.loading
          && props.hasMore) {
        state.upStatus = UP_DOWN_STATUS.loading;
        emit('loadmore');
      }
}

const fnScroll = rAFthrottle(onListScroll, 16.6 , {leading:true, trailing:true});

  // measure items size
const onMeasureItems = (nodes) => {
    if (!nodes) return;
    const nodesItemArr = state.nodesItemArr;
    const startIdx = state.curAncharItem.index;
    let totalDelta = 0;
    for (let i=0; i<nodes.length; i += 1) {
        let targetIdx = 0;
        if (i >= state.visibleDataList.length) { //fix idx 
            targetIdx = startIdx - (nodes.length - i);
            break;
        }else {
            targetIdx = startIdx + i;
        }
        const node = nodes[i];
        const item = nodesItemArr[targetIdx] || { height : 0 };
        const delta = node.clientHeight - item.height;
        if (delta) {
            nodesItemArr[targetIdx] = {
            height: node.clientHeight
        }
            totalDelta += delta;
        }
    }
    updateScrollHeight(totalDelta);
    needMeasureItems = false;
}

const updateScrollHeight = (delta) => {
    if (delta) {
        state.scrollHeight += delta;
    }
}

const calculateAnchoredItem = (initialAnchor, delta) => {
    if (!delta) return initialAnchor;
    const dir = delta > 0 ? 1 : -1;
    delta += initialAnchor.offset;
    let idx = initialAnchor.index;
    if (dir > 0 && delta > 0) {
        while (delta > 0 && idx < state.nodesItemArr.length && delta > ((state.nodesItemArr[idx] as any).height || props.estimatedItemHeight)) {
            delta -= (state.nodesItemArr[idx] as any).height;
            idx += 1;
        }
    } else {
        while (delta < 0 && idx > 0 && (state.nodesItemArr[idx - 1] as any).height) {
            delta += (state.nodesItemArr[idx - 1] as any).height;
            idx -= 1;
        }
    }
    if (idx >= state.nodesItemArr.length ) {
        idx = state.nodesItemArr.length - 1;
    }
    return {
        index: idx,
        offset: delta,
    };
}

const updateVisableData = (scrollTop, ancharItem, lastAncharItem, force) => {
      if(force || ancharItem.index != state.curAncharItem.index || state.visibleDataList.length < lastAncharItem.index - ancharItem.index) {
        // update pageSize
        let pageSize = Math.max(1, lastAncharItem.index - ancharItem.index + 1);
        if(pageSize > state.maxPageSize) {
            state.maxPageSize = pageSize;
        }
        // update poolSize
        let estimatePoolSize = state.maxPageSize + props.runawayItems  + props.opsrunawayItems; // cur,pre,next
        if(estimatePoolSize > state.poolSize){
            state.poolSize = estimatePoolSize;
        }
        // calculate poolSize
        let currentPoolSize = state.poolSize;
        if(props.itemList.length < pageSize){
          currentPoolSize = props.itemList.length;
        }
        let contentOffset = 0;
        contentOffset = scrollTop - ancharItem.offset;
        // calculate visable data
        let dataList: any[] = [];
        let nextDataList: any[] = [];
        let preDataList: any[] = [];
        if(currentPoolSize === props.itemList.length){
          dataList = props.itemList.slice(ancharItem.index, props.itemList.length);
           state.unVisibleDataPoolList = [];
        }else{
          const endPos = ancharItem.index + pageSize;
          dataList = props.itemList.slice(ancharItem.index, endPos);
          //next screen data
          const nextStartPos = endPos;
          const nextEndPos = Math.min(endPos + props.runawayItems, props.itemList.length);
          if(nextStartPos !== nextEndPos) {
            nextDataList = props.itemList.slice(nextStartPos, nextEndPos);
          }
          //pre screen data
          const preDataSize = currentPoolSize - dataList.length - nextDataList.length;
          const preEndPos = ancharItem.index;
          const preStartPos = Math.max(0, preEndPos - preDataSize);
          preDataList = props.itemList.slice(preStartPos, preEndPos);
          state.unVisibleDataPoolList = preDataList;
          dataList = dataList.concat(nextDataList);
        }
        state.visibleDataList = dataList;
        content.value!.style.webkitTransform = `translate3d(0, ${ contentOffset }px, 0)`;
        forceUpdate = false;
        return contentOffset;
      }
      return scrollTop;
}

const transitionEnd = () => {
    state.pullAnimationMove = false;
}

const getPoint = (event) => {
    return {
        x: event.touches ? event.touches[0].pageX : event.clientX,
        y: event.touches ? event.touches[0].pageY : event.clientY
    }
}

// pull down refresh region
const touchStart = (event) => {
    if (event && event.type === 'mousedown') {
        root.value!.addEventListener('mousemove', touchMove);
    }
    state.pullAnimationMove = false;
    const point = getPoint(event);
    touchStartPoint = {
    startX: point.x,
    startY: point.y
    }
    lastMovePoint = touchStartPoint;
    state.startHeight = downwarp.value!.offsetHeight || 0;
    state.startScroll = viewport.value!.scrollTop || 0;
};
const touchMove = (event) => {
    if (!touchStartPoint) return;
    const point = getPoint(event);
    const isDown = point.y - lastMovePoint!.startY > 0;
    if (isDown) {
    const scrollTop = viewport.value!.scrollTop;
    if (scrollTop <= 0) {
        if (event && event.cancelable && !event.defaultPrevented) event.preventDefault();
        if (state.startScroll > 0 || scrollTop < 0) {
        return;
        }
    }
    }
    lastMovePoint = {
    startX: point.x,
    startY: point.y
    };
    const diff = point.y - touchStartPoint.startY - state.startScroll;
    if (diff < 0 ) {
    return;
    }
    state.pullDistance = state.startHeight + Math.pow(diff, 0.8);
    if (state.pullDistance > props.pullDownOffset) {
    state.pullStatus = PULL_DOWN_STATUS.canLoading;
    } else {
    state.pullStatus = PULL_DOWN_STATUS.none;
    }
};
const touchEnd = (event) => {
    if (event && event.type === 'mouseup') {
        root.value!.removeEventListener('mousemove', touchMove);
    }
    touchStartPoint = undefined;
    if (state.pullStatus === PULL_DOWN_STATUS.canLoading) {
    if (state.pullDistance > props.pullDownOffset)
        state.pullStatus = PULL_DOWN_STATUS.loading;
        state.pullAnimationMove = true;
        state.pullDistance = props.pullDownOffset;
        emit('refresh');
    } else if (state.pullStatus === PULL_DOWN_STATUS.none && state.pullDistance) {
        state.pullAnimationMove = true;
        state.pullDistance = 0;
    }
};

const rigisterPullDownListeners = () => {
    root.value!.addEventListener('touchstart', touchStart);
    root.value!.addEventListener('touchmove', touchMove, {passive: false});
    root.value!.addEventListener('touchend', touchEnd);
    root.value!.addEventListener('mousedown', touchStart);
    root.value!.addEventListener('mouseup', touchEnd);
    root.value!.addEventListener('mouseleave', touchEnd);
}
    
const removePullDownListeners = () => {
    try {
        root.value!.removeEventListener('touchstart', touchStart);
        root.value!.removeEventListener('touchmove', touchMove);
        root.value!.removeEventListener('touchend', touchEnd);
        root.value!.removeEventListener('mousedown', touchStart);
        root.value!.removeEventListener('mouseup', touchEnd);
        root.value!.removeEventListener('mouseleave', touchEnd);
    } catch (err) {
        window.console.log(err);
    }
}

const fillItemsEstimateHeight = () => {
      // update cache height
      const itemList = props.itemList;
      const nodesItemArr = state.nodesItemArr;
      if(itemList.length != state.nodesItemArr.length) {
        if(itemList.length > state.nodesItemArr.length) {
          const estimateHeight = props.estimatedItemHeight;
          let totalDelta = 0;
          while (nodesItemArr.length < itemList.length) {
            (nodesItemArr as any).push({
              height: estimateHeight
            });
            totalDelta += estimateHeight;
          }
          state.scrollHeight += totalDelta;
        }else {
          const diffCount = state.nodesItemArr.length - itemList.length;
          let totalDelta = 0;
          for(let i = 0; i < diffCount; i += 1) {
            totalDelta += (nodesItemArr[nodesItemArr.length - 1 - i] as any).height;
          }
          state.nodesItemArr.splice(state.nodesItemArr.length - diffCount, diffCount);
          state.scrollHeight -= totalDelta;
        }
      } 
    }

const endPullDown = () => {
    state.pullAnimationMove = true;
    state.pullStatus = PULL_DOWN_STATUS.none;
    state.pullDistance = 0;
}

watch(() => props.itemList, () => {
    state.upStatus = UP_DOWN_STATUS.none;
    if (state.pullStatus === PULL_DOWN_STATUS.loading) {
    endPullDown();
    }
    fillItemsEstimateHeight();
    forceUpdate = true;
    onListScroll();
    if (props.nestBottom) {
        nextTick(() => {
        viewport.value!.scrollTo({
            left: 0,
            top: state.scrollHeight,
            behavior: 'smooth',
        });
    });
    }
}, {
    deep: true
});
    

onMounted(() => {
    state.screenHeight = viewport.value?.offsetHeight || 0;
    onListScroll();
    ro = new ResizeObserver(() => {
      needMeasureItems = true;
    });
    ro.observe(content.value!);
    if (props.usePullDownRefresh) {
        rigisterPullDownListeners();
    }
});

onBeforeUnmount(() => {
    if(props.usePullDownRefresh){
        removePullDownListeners();
    }
});
    
</script>

<style scoped>
.root {
  position: relative;
  height:100%;
  overflow: hidden;
}
.virtual-list-view-phantom {
  top:0;
}
.virtual-list-view-content {
  top:0;
  position: absolute;
  padding: 0 0px;
  width: 100%;
}
.virtual-list-view {
  position: relative;
  overflow-y: scroll;
  height: 100%;
}
.item-invisible {
 visibility: hidden;
 position: absolute;
 top:0;
}
/*css for pull down refresh*/
.downwarp {
  position: relative;
  width: 100%;
  overflow: hidden;
  text-align: center;
}
.downwarp .downwarp-content {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  min-height: 30px;
  padding: 10px 0;
}
.downwarp-progress {
  display: inline-block;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid gray;
  border-bottom-color: transparent;
  vertical-align: middle;
}
.downwarp-tip {
  display: inline-block;
  font-size: 12px;
  color: gray;
  vertical-align: middle;
  margin-left: 8px;
}
.rotate {
  animation: rotate 0.6s linear infinite;
}
.pull-top-animation {
  transition-duration: 300ms;
  transition-property: height;
  transform: translateZ(0);
}
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
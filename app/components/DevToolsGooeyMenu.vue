<template>
  <div class="fixed bottom-10 right-10 z-50 pointer-events-none">
    <div class="relative w-[200px] h-[300px]">
      <nav
        class="menu pointer-events-auto"
        :style="{
          filter: 'url(#gooey-devtools-menu)',
          width: '100%',
          height: '100%',
          '--spring-easing':
            'linear(0, 0.88117 15.492%, 1.09261 23.232%, 1.10421 28.713%, 0.99031 49.585%,0.99995)',
        }"
      >
        <input
          id="devtools-menu"
          v-model="menuOpen"
          type="checkbox"
          class="peer hidden"
          name="devtools-menu"
        />

        <label
          class="absolute right-0 bottom-0 z-10 flex size-14 scale-125 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all duration-1000 [transition-timing-function:var(--spring-easing)] hover:scale-110 peer-checked:scale-100 peer-checked:rotate-[135deg]"
          for="devtools-menu"
        >
          <Icon name="lucide:plus" class="size-5" />
        </label>

        <button
          class="absolute right-0 bottom-0 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-300 ease-in hover:scale-110 peer-checked:translate-y-[-80px] peer-checked:duration-1000 peer-checked:[transition-timing-function:var(--spring-easing)]"
          @click="openDevtoolsDrawer"
        >
          <Icon name="lucide:code-2" class="size-5" />
        </button>

        <button
          class="absolute right-0 bottom-0 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform duration-300 ease-in hover:scale-110 peer-checked:translate-y-[-162px] peer-checked:duration-1000 peer-checked:[transition-timing-function:var(--spring-easing)]"
          @click="reloadWindow"
        >
          <Icon name="lucide:refresh-cw" class="size-5" />
        </button>
      </nav>

      <svg
        class="absolute w-0 h-0"
        width="0"
        height="0"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
      >
        <defs>
          <filter id="gooey-devtools-menu">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -10"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>
    </div>

    <!-- DevTools Drawer -->
    <UiDrawer v-model:open="drawerOpen" direction="right">
      <UiDrawerContent class="w-full sm:max-w-2xl h-[90vh] flex flex-col">
        <UiDrawerHeader>
          <UiDrawerTitle>Developer Tools</UiDrawerTitle>
          <UiDrawerDescription>
            Toggle developer tools or reload the window
          </UiDrawerDescription>
        </UiDrawerHeader>

        <div class="flex flex-col h-full">
          <!-- Actions Section -->
          <div class="p-4 space-y-4 flex-shrink-0">
            <UiButton
              variant="outline"
              class="w-full justify-start gap-2"
              @click="toggleDevtools"
            >
              <Icon name="lucide:code-2" class="size-4" />
              <span>{{ devtoolsOpen ? 'Close' : 'Open' }} Developer Tools</span>
            </UiButton>

            <UiButton
              variant="outline"
              class="w-full justify-start gap-2"
              @click="reloadWindow"
            >
              <Icon name="lucide:refresh-cw" class="size-4" />
              <span>Reload Window</span>
            </UiButton>

            <UiButton
              variant="outline"
              class="w-full justify-start gap-2"
              @click="inspectElement"
            >
              <Icon name="lucide:search" class="size-4" />
              <span>Inspect Element</span>
            </UiButton>

            <div class="pt-4 border-t">
              <h4 class="text-sm font-semibold mb-2">Keyboard Shortcuts</h4>
              <div class="space-y-2 text-sm text-muted-foreground">
                <div class="flex items-center justify-between">
                  <span>Toggle DevTools</span>
                  <kbd class="px-2 py-1 text-xs font-semibold bg-muted rounded">F12</kbd>
                </div>
                <div class="flex items-center justify-between">
                  <span>Reload Window</span>
                  <kbd class="px-2 py-1 text-xs font-semibold bg-muted rounded">Ctrl+R</kbd>
                </div>
              </div>
            </div>

            <div v-if="devtoolsOpen" class="pt-4 border-t">
              <div class="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                <Icon name="lucide:check-circle-2" class="size-4" />
                <span>Developer Tools are open</span>
              </div>
            </div>
          </div>

          <!-- Console Logs Section -->
          <div class="border-t flex-1 flex flex-col min-h-0">
            <div class="p-4 pb-2 flex items-center justify-between flex-shrink-0 border-b">
              <div class="flex items-center gap-2">
                <h4 class="text-sm font-semibold">Console Logs</h4>
                <UiTabs v-model="mainTab" class="flex-1">
                  <UiTabsList class="h-7">
                    <UiTabsTrigger value="console" class="h-7 px-2 text-xs">
                      <Icon name="lucide:terminal" class="size-3" />
                      Console
                    </UiTabsTrigger>
                    <UiTabsTrigger value="network" class="h-7 px-2 text-xs">
                      <Icon name="lucide:network" class="size-3" />
                      Network
                      <UiBadge v-if="networkRequests.length > 0" variant="secondary" class="ml-1.5 h-4 px-1.5 text-xs">
                        {{ networkRequests.length }}
                      </UiBadge>
                    </UiTabsTrigger>
                  </UiTabsList>
                </UiTabs>
              </div>
              <div v-if="mainTab === 'console'" class="flex items-center gap-2">
                <UiButton
                  variant="ghost"
                  size="sm"
                  class="h-7 px-2 text-xs"
                  @click="copyAllLogs"
                >
                  <Icon name="lucide:copy" class="size-3" />
                  Copy All
                </UiButton>
                <UiButton
                  variant="ghost"
                  size="sm"
                  class="h-7 px-2 text-xs"
                  @click="clearLogs"
                >
                  <Icon name="lucide:trash-2" class="size-3" />
                  Clear
                </UiButton>
                <UiButton
                  variant="ghost"
                  size="sm"
                  class="h-7 px-2 text-xs"
                  @click="autoScroll = !autoScroll"
                >
                  <Icon 
                    :name="autoScroll ? 'lucide:lock' : 'lucide:unlock'" 
                    class="size-3" 
                  />
                  {{ autoScroll ? 'Auto' : 'Manual' }}
                </UiButton>
              </div>
              <div v-else class="flex items-center gap-2">
                <UiButton
                  variant="ghost"
                  size="sm"
                  class="h-7 px-2 text-xs"
                  @click="clearNetworkRequests"
                >
                  <Icon name="lucide:trash-2" class="size-3" />
                  Clear
                </UiButton>
              </div>
            </div>

            <!-- Console Tab Content -->
            <div v-if="mainTab === 'console'" class="flex-1 flex flex-col min-h-0">
              <!-- Tabs for filtering -->
              <UiTabs v-model="activeLogTab" class="flex-1 flex flex-col min-h-0">
              <UiTabsList class="w-full justify-start px-4 py-2 flex-shrink-0">
                <UiTabsTrigger value="all">
                  All
                  <UiBadge v-if="allLogCount > 0" variant="secondary" class="ml-1.5 h-4 px-1.5 text-xs">
                    {{ allLogCount }}
                  </UiBadge>
                </UiTabsTrigger>
                <UiTabsTrigger value="messages">
                  Messages
                  <UiBadge v-if="messageCount > 0" variant="secondary" class="ml-1.5 h-4 px-1.5 text-xs">
                    {{ messageCount }}
                  </UiBadge>
                </UiTabsTrigger>
                <UiTabsTrigger value="warnings">
                  Warnings
                  <UiBadge v-if="warningCount > 0" variant="secondary" class="ml-1.5 h-4 px-1.5 text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
                    {{ warningCount }}
                  </UiBadge>
                </UiTabsTrigger>
                <UiTabsTrigger value="errors">
                  Errors
                  <UiBadge v-if="errorCount > 0" variant="destructive" class="ml-1.5 h-4 px-1.5 text-xs">
                    {{ errorCount }}
                  </UiBadge>
                </UiTabsTrigger>
              </UiTabsList>

              <!-- Tab Content -->
              <div class="flex-1 overflow-hidden min-h-0">
                <UiTabsContent value="all" class="h-full m-0 mt-0 p-0 overflow-hidden">
                  <div 
                    ref="consoleContainerRef"
                    class="h-full overflow-y-auto p-4 space-y-1 font-mono text-xs"
                  >
                    <div
                      v-for="(log, index) in groupedLogs"
                      :key="`${log.firstTimestamp}-${index}`"
                      :class="[
                        'p-2 rounded border-l-2 cursor-pointer transition-colors hover:bg-muted/50',
                        logTypeClasses[log.type] || logTypeClasses.log
                      ]"
                      @click="openLogModal(log)"
                    >
                      <div class="flex items-center justify-between mb-1">
                        <div class="flex items-center gap-2">
                          <Icon 
                            :name="logTypeIcons[log.type] || 'lucide:info'" 
                            class="size-3"
                          />
                          <span class="text-xs font-semibold opacity-70">
                            {{ new Date(log.firstTimestamp).toLocaleTimeString() }}
                          </span>
                          <span class="text-xs opacity-60">{{ log.type.toUpperCase() }}</span>
                          <UiBadge 
                            v-if="log.count > 1" 
                            variant="secondary" 
                            class="h-4 px-1.5 text-xs"
                          >
                            {{ log.count }}x
                          </UiBadge>
                        </div>
                        <Icon name="lucide:chevron-right" class="size-3 opacity-50" />
                      </div>
                      <div class="whitespace-pre-wrap break-words text-xs">{{ log.message }}</div>
                      <div v-if="log.initiator" class="mt-1 text-xs opacity-60 truncate">
                        {{ log.initiator }}
                      </div>
                    </div>
                    <div v-if="groupedLogs.length === 0" class="text-center text-muted-foreground py-8">
                      <Icon name="lucide:terminal" class="size-8 mx-auto mb-2 opacity-50" />
                      <p class="text-xs">No console logs yet</p>
                    </div>
                  </div>
                </UiTabsContent>
                <UiTabsContent value="messages" class="h-full m-0 mt-0 p-0 overflow-hidden">
                  <div 
                    class="h-full overflow-y-auto p-4 space-y-1 font-mono text-xs"
                  >
                    <div
                      v-for="(log, index) in filteredGroupedLogs(['log', 'info', 'debug'])"
                      :key="`${log.firstTimestamp}-${index}`"
                      :class="[
                        'p-2 rounded border-l-2 cursor-pointer transition-colors hover:bg-muted/50',
                        logTypeClasses[log.type] || logTypeClasses.log
                      ]"
                      @click="openLogModal(log)"
                    >
                      <div class="flex items-center justify-between mb-1">
                        <div class="flex items-center gap-2">
                          <Icon 
                            :name="logTypeIcons[log.type] || 'lucide:info'" 
                            class="size-3"
                          />
                          <span class="text-xs font-semibold opacity-70">
                            {{ new Date(log.firstTimestamp).toLocaleTimeString() }}
                          </span>
                          <span class="text-xs opacity-60">{{ log.type.toUpperCase() }}</span>
                          <UiBadge 
                            v-if="log.count > 1" 
                            variant="secondary" 
                            class="h-4 px-1.5 text-xs"
                          >
                            {{ log.count }}x
                          </UiBadge>
                        </div>
                        <Icon name="lucide:chevron-right" class="size-3 opacity-50" />
                      </div>
                      <div class="whitespace-pre-wrap break-words text-xs">{{ log.message }}</div>
                      <div v-if="log.initiator" class="mt-1 text-xs opacity-60 truncate">
                        {{ log.initiator }}
                      </div>
                    </div>
                  </div>
                </UiTabsContent>
                <UiTabsContent value="warnings" class="h-full m-0 mt-0 p-0 overflow-hidden">
                  <div 
                    class="h-full overflow-y-auto p-4 space-y-1 font-mono text-xs"
                  >
                    <div
                      v-for="(log, index) in filteredGroupedLogs(['warn'])"
                      :key="`${log.firstTimestamp}-${index}`"
                      :class="[
                        'p-2 rounded border-l-2 cursor-pointer transition-colors hover:bg-muted/50',
                        logTypeClasses[log.type] || logTypeClasses.log
                      ]"
                      @click="openLogModal(log)"
                    >
                      <div class="flex items-center justify-between mb-1">
                        <div class="flex items-center gap-2">
                          <Icon 
                            :name="logTypeIcons[log.type] || 'lucide:info'" 
                            class="size-3"
                          />
                          <span class="text-xs font-semibold opacity-70">
                            {{ new Date(log.firstTimestamp).toLocaleTimeString() }}
                          </span>
                          <span class="text-xs opacity-60">{{ log.type.toUpperCase() }}</span>
                          <UiBadge 
                            v-if="log.count > 1" 
                            variant="secondary" 
                            class="h-4 px-1.5 text-xs bg-yellow-500/20 text-yellow-600 dark:text-yellow-400"
                          >
                            {{ log.count }}x
                          </UiBadge>
                        </div>
                        <Icon name="lucide:chevron-right" class="size-3 opacity-50" />
                      </div>
                      <div class="whitespace-pre-wrap break-words text-xs">{{ log.message }}</div>
                      <div v-if="log.initiator" class="mt-1 text-xs opacity-60 truncate">
                        {{ log.initiator }}
                      </div>
                    </div>
                  </div>
                </UiTabsContent>
                <UiTabsContent value="errors" class="h-full m-0 mt-0 p-0 overflow-hidden">
                  <div 
                    class="h-full overflow-y-auto p-4 space-y-1 font-mono text-xs"
                  >
                    <div
                      v-for="(log, index) in filteredGroupedLogs(['error'])"
                      :key="`${log.firstTimestamp}-${index}`"
                      :class="[
                        'p-2 rounded border-l-2 cursor-pointer transition-colors hover:bg-muted/50',
                        logTypeClasses[log.type] || logTypeClasses.log
                      ]"
                      @click="openLogModal(log)"
                    >
                      <div class="flex items-center justify-between mb-1">
                        <div class="flex items-center gap-2">
                          <Icon 
                            :name="logTypeIcons[log.type] || 'lucide:info'" 
                            class="size-3"
                          />
                          <span class="text-xs font-semibold opacity-70">
                            {{ new Date(log.firstTimestamp).toLocaleTimeString() }}
                          </span>
                          <span class="text-xs opacity-60">{{ log.type.toUpperCase() }}</span>
                          <UiBadge 
                            v-if="log.count > 1" 
                            variant="destructive" 
                            class="h-4 px-1.5 text-xs"
                          >
                            {{ log.count }}x
                          </UiBadge>
                        </div>
                        <Icon name="lucide:chevron-right" class="size-3 opacity-50" />
                      </div>
                      <div class="whitespace-pre-wrap break-words text-xs">{{ log.message }}</div>
                      <div v-if="log.initiator" class="mt-1 text-xs opacity-60 truncate">
                        {{ log.initiator }}
                      </div>
                    </div>
                  </div>
                </UiTabsContent>
              </div>
              </UiTabs>
            </div>

            <!-- Network Tab Content -->
            <div v-else class="flex-1 flex flex-col min-h-0">
              <div class="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs">
                <div
                  v-for="(request, index) in sortedNetworkRequests"
                  :key="request.id || index"
                  class="p-2 rounded border-l-2 cursor-pointer transition-colors hover:bg-muted/50"
                  :class="getNetworkBorderColor(request.status) || 'border-l-blue-500 bg-muted/30'"
                  @click="openNetworkModal(request)"
                >
                  <div class="flex items-center justify-between mb-1">
                    <div class="flex items-center gap-2 min-w-0 flex-1">
                      <Icon 
                        :name="getNetworkIcon(request.method)" 
                        class="size-3 flex-shrink-0"
                      />
                      <span class="font-semibold text-xs flex-shrink-0">{{ request.method }}</span>
                      <span class="text-xs opacity-70 truncate min-w-0">{{ getShortUrl(request.url) }}</span>
                      <UiBadge 
                        v-if="request.status"
                        variant="secondary"
                        class="h-4 px-1.5 text-xs flex-shrink-0"
                        :class="getNetworkStatusColor(request.status)"
                      >
                        {{ request.status }}
                      </UiBadge>
                      <UiBadge 
                        v-if="request.type"
                        variant="outline"
                        class="h-4 px-1.5 text-xs flex-shrink-0 text-xs opacity-60"
                      >
                        {{ request.type.toUpperCase() }}
                      </UiBadge>
                    </div>
                    <div class="flex items-center gap-2 text-xs opacity-60 flex-shrink-0">
                      <span v-if="request.duration">{{ request.duration }}ms</span>
                      <Icon name="lucide:chevron-right" class="size-3" />
                    </div>
                  </div>
                  <div v-if="request.error" class="text-xs text-red-600 dark:text-red-400 mt-1">
                    Error: {{ request.error }}
                  </div>
                </div>
                <div v-if="networkRequests.length === 0" class="text-center text-muted-foreground py-8">
                  <Icon name="lucide:network" class="size-8 mx-auto mb-2 opacity-50" />
                  <p class="text-xs">No network requests yet</p>
                  <p class="text-xs opacity-60 mt-1">Network requests will appear here when they are made</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <UiDrawerFooter>
          <UiButton variant="outline" @click="drawerOpen = false">
            Close
          </UiButton>
        </UiDrawerFooter>
      </UiDrawerContent>
    </UiDrawer>

    <!-- Log Detail Modal -->
    <UiDialog v-model:open="logModalOpen">
      <UiDialogContent class="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <UiDialogHeader>
          <UiDialogTitle class="flex items-center gap-2">
            <Icon 
              :name="logTypeIcons[selectedLog?.type || 'log'] || 'lucide:info'" 
              class="size-5"
              :class="logTypeColorClasses[selectedLog?.type || 'log']"
            />
            Console {{ (selectedLog?.type || 'log').toUpperCase() }}
          </UiDialogTitle>
          <UiDialogDescription>
            {{ new Date(selectedLog?.firstTimestamp || 0).toLocaleString() }}
            <span v-if="selectedLog?.count && selectedLog.count > 1" class="ml-2">
              (Repeated {{ selectedLog.count }} times)
            </span>
          </UiDialogDescription>
        </UiDialogHeader>

        <div v-if="selectedLog" class="flex-1 overflow-y-auto p-4 space-y-4">
          <!-- Message -->
          <div>
            <h4 class="text-sm font-semibold mb-2">Message</h4>
            <div class="p-3 rounded-md bg-muted/50 font-mono text-sm whitespace-pre-wrap break-words">
              {{ selectedLog.message }}
            </div>
          </div>

          <!-- Data/Objects -->
          <div v-if="selectedLog.data && selectedLog.data.length > 0">
            <h4 class="text-sm font-semibold mb-2">Data</h4>
            <div class="space-y-2">
              <div
                v-for="(item, index) in selectedLog.data"
                :key="index"
                class="p-3 rounded-md bg-muted/30 border border-border"
              >
                <pre class="text-xs overflow-x-auto">{{ formatLogData([item]) }}</pre>
              </div>
            </div>
          </div>

          <!-- Stack Trace -->
          <div v-if="selectedLog.stack" class="pt-4 border-t">
            <h4 class="text-sm font-semibold mb-2">Stack Trace</h4>
            <div class="p-3 rounded-md bg-muted/30 border border-border font-mono text-xs whitespace-pre-wrap break-words max-h-64 overflow-y-auto">
              {{ selectedLog.stack }}
            </div>
          </div>

          <!-- Metadata -->
          <div class="pt-4 border-t">
            <h4 class="text-sm font-semibold mb-2">Metadata</h4>
            <div class="space-y-1 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">Type:</span>
                <span class="font-mono">{{ selectedLog.type }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-muted-foreground">First Occurrence:</span>
                <span class="font-mono text-xs">{{ new Date(selectedLog.firstTimestamp).toLocaleString() }}</span>
              </div>
              <div v-if="selectedLog.count > 1" class="flex items-center justify-between">
                <span class="text-muted-foreground">Last Occurrence:</span>
                <span class="font-mono text-xs">{{ new Date(selectedLog.lastTimestamp).toLocaleString() }}</span>
              </div>
              <div v-if="selectedLog.count && selectedLog.count > 1" class="flex items-center justify-between">
                <span class="text-muted-foreground">Count:</span>
                <span class="font-mono">{{ selectedLog.count }}</span>
              </div>
              <div v-if="selectedLog.initiator" class="flex items-center justify-between">
                <span class="text-muted-foreground">Initiator:</span>
                <span class="font-mono text-xs break-all">{{ selectedLog.initiator }}</span>
              </div>
            </div>
          </div>
        </div>

        <UiDialogFooter>
          <UiButton variant="outline" @click="logModalOpen = false">
            Close
          </UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>

    <!-- Network Request Detail Modal -->
    <UiDialog v-model:open="networkModalOpen">
      <UiDialogContent class="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <UiDialogHeader>
          <UiDialogTitle class="flex items-center gap-2">
            <Icon 
              :name="getNetworkIcon(selectedNetworkRequest?.method || 'GET')" 
              class="size-5"
              :class="getNetworkStatusColor(selectedNetworkRequest?.status)"
            />
            <span class="font-mono text-sm">{{ selectedNetworkRequest?.method || 'GET' }}</span>
            <span class="text-xs text-muted-foreground truncate max-w-md">
              {{ selectedNetworkRequest?.url }}
            </span>
          </UiDialogTitle>
          <UiDialogDescription>
            {{ new Date(selectedNetworkRequest?.startTime || 0).toLocaleString() }}
            <span v-if="selectedNetworkRequest?.duration" class="ml-2">
              · {{ selectedNetworkRequest.duration }}ms
            </span>
            <span v-if="selectedNetworkRequest?.status" class="ml-2">
              · Status: {{ selectedNetworkRequest.status }} {{ selectedNetworkRequest.statusText || '' }}
            </span>
          </UiDialogDescription>
        </UiDialogHeader>

        <div v-if="selectedNetworkRequest" class="flex-1 overflow-y-auto p-4 space-y-4">
          <UiTabs v-model="networkModalTab" default-value="headers" class="w-full">
            <UiTabsList class="w-full justify-start">
              <UiTabsTrigger value="headers">Headers</UiTabsTrigger>
              <UiTabsTrigger value="payload">Payload</UiTabsTrigger>
              <UiTabsTrigger value="response">Response</UiTabsTrigger>
              <UiTabsTrigger value="timing">Timing</UiTabsTrigger>
            </UiTabsList>

            <UiTabsContent value="headers" class="space-y-4 mt-4">
              <div>
                <h4 class="text-sm font-semibold mb-2">Request Headers</h4>
                <div class="p-3 rounded-md bg-muted/30 border border-border font-mono text-xs">
                  <div
                    v-for="(value, key) in selectedNetworkRequest.requestHeaders"
                    :key="key"
                    class="mb-1"
                  >
                    <span class="font-semibold">{{ key }}:</span>
                    <span class="ml-2">{{ value }}</span>
                  </div>
                  <div v-if="!selectedNetworkRequest.requestHeaders || Object.keys(selectedNetworkRequest.requestHeaders).length === 0" class="text-muted-foreground">
                    No request headers
                  </div>
                </div>
              </div>
              <div>
                <h4 class="text-sm font-semibold mb-2">Response Headers</h4>
                <div class="p-3 rounded-md bg-muted/30 border border-border font-mono text-xs">
                  <div
                    v-for="(value, key) in selectedNetworkRequest.responseHeaders"
                    :key="key"
                    class="mb-1"
                  >
                    <span class="font-semibold">{{ key }}:</span>
                    <span class="ml-2">{{ value }}</span>
                  </div>
                  <div v-if="!selectedNetworkRequest.responseHeaders || Object.keys(selectedNetworkRequest.responseHeaders).length === 0" class="text-muted-foreground">
                    No response headers
                  </div>
                </div>
              </div>
            </UiTabsContent>

            <UiTabsContent value="payload" class="mt-4">
              <div>
                <h4 class="text-sm font-semibold mb-2">Request Body</h4>
                <div class="p-3 rounded-md bg-muted/30 border border-border">
                  <pre class="text-xs overflow-x-auto whitespace-pre-wrap break-words">{{ formatNetworkBody(selectedNetworkRequest.requestBody) }}</pre>
                </div>
              </div>
            </UiTabsContent>

            <UiTabsContent value="response" class="mt-4">
              <div>
                <h4 class="text-sm font-semibold mb-2">Response Body</h4>
                <div class="p-3 rounded-md bg-muted/30 border border-border">
                  <pre class="text-xs overflow-x-auto whitespace-pre-wrap break-words">{{ formatNetworkBody(selectedNetworkRequest.responseBody) }}</pre>
                </div>
              </div>
            </UiTabsContent>

            <UiTabsContent value="timing" class="mt-4">
              <div class="space-y-2 text-sm">
                <div class="flex items-center justify-between">
                  <span class="text-muted-foreground">Start Time:</span>
                  <span class="font-mono text-xs">{{ new Date(selectedNetworkRequest.startTime).toLocaleString() }}</span>
                </div>
                <div v-if="selectedNetworkRequest.endTime" class="flex items-center justify-between">
                  <span class="text-muted-foreground">End Time:</span>
                  <span class="font-mono text-xs">{{ new Date(selectedNetworkRequest.endTime).toLocaleString() }}</span>
                </div>
                <div v-if="selectedNetworkRequest.duration" class="flex items-center justify-between">
                  <span class="text-muted-foreground">Duration:</span>
                  <span class="font-mono text-xs">{{ selectedNetworkRequest.duration }}ms</span>
                </div>
                <div v-if="selectedNetworkRequest.status" class="flex items-center justify-between">
                  <span class="text-muted-foreground">Status:</span>
                  <span class="font-mono text-xs" :class="getNetworkStatusColor(selectedNetworkRequest.status)">
                    {{ selectedNetworkRequest.status }} {{ selectedNetworkRequest.statusText || '' }}
                  </span>
                </div>
              </div>
            </UiTabsContent>
          </UiTabs>
        </div>

        <UiDialogFooter>
          <UiButton variant="outline" @click="networkModalOpen = false">
            Close
          </UiButton>
        </UiDialogFooter>
      </UiDialogContent>
    </UiDialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import UiDrawer from '~/components/ui/Drawer/Drawer.vue';
import UiDrawerContent from '~/components/ui/Drawer/Content.vue';
import UiDrawerHeader from '~/components/ui/Drawer/Header.vue';
import UiDrawerTitle from '~/components/ui/Drawer/Title.vue';
import UiDrawerDescription from '~/components/ui/Drawer/Description.vue';
import UiDrawerFooter from '~/components/ui/Drawer/Footer.vue';
import UiButton from '~/components/ui/Button.vue';
import UiTabs from '~/components/ui/Tabs/Tabs.vue';
import UiTabsList from '~/components/ui/Tabs/List.vue';
import UiTabsTrigger from '~/components/ui/Tabs/Trigger.vue';
import UiTabsContent from '~/components/ui/Tabs/Content.vue';
import UiDialog from '~/components/ui/Dialog/Dialog.vue';
import UiDialogContent from '~/components/ui/Dialog/Content.vue';
import UiDialogHeader from '~/components/ui/Dialog/Header.vue';
import UiDialogTitle from '~/components/ui/Dialog/Title.vue';
import UiDialogDescription from '~/components/ui/Dialog/Description.vue';
import UiDialogFooter from '~/components/ui/Dialog/Footer.vue';
import UiBadge from '~/components/ui/Badge.vue';

const menuOpen = ref(false);
const drawerOpen = ref(false);
const devtoolsOpen = ref(false);
const mainTab = ref('console');
const networkModalOpen = ref(false);
const networkModalTab = ref('headers');
const selectedNetworkRequest = ref<NetworkRequest | null>(null);

interface ConsoleLog {
  type: string;
  message: string;
  data?: any[];
  timestamp: number;
  initiator?: string;
  stack?: string;
}

interface NetworkRequest {
  id: string;
  method: string;
  url: string;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseHeaders?: Record<string, string>;
  responseBody?: any;
  status?: number;
  statusText?: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  type: 'xhr' | 'fetch' | 'websocket' | 'other';
  error?: string;
}

interface GroupedLog extends Omit<ConsoleLog, 'timestamp'> {
  count: number;
  firstTimestamp: number;
  lastTimestamp: number;
}

const consoleLogs = ref<ConsoleLog[]>([]);
const networkRequests = ref<NetworkRequest[]>([]);
const autoScroll = ref(true);
const consoleContainerRef = ref<HTMLElement | null>(null);
const activeLogTab = ref('all');
const logModalOpen = ref(false);
const selectedLog = ref<GroupedLog | null>(null);
const maxLogs = 500;
const maxNetworkRequests = 500;
let requestIdCounter = 0;

// Log type styling
const logTypeClasses = {
  log: 'bg-muted/30 border-l-blue-500 text-foreground',
  error: 'bg-red-500/10 border-l-red-500 text-red-600 dark:text-red-400',
  warn: 'bg-yellow-500/10 border-l-yellow-500 text-yellow-600 dark:text-yellow-400',
  info: 'bg-blue-500/10 border-l-blue-500 text-blue-600 dark:text-blue-400',
  debug: 'bg-purple-500/10 border-l-purple-500 text-purple-600 dark:text-purple-400',
};

const logTypeIcons = {
  log: 'lucide:terminal',
  error: 'lucide:alert-circle',
  warn: 'lucide:alert-triangle',
  info: 'lucide:info',
  debug: 'lucide:bug',
};

const logTypeColorClasses = {
  log: 'text-blue-500',
  error: 'text-red-500',
  warn: 'text-yellow-500',
  info: 'text-blue-400',
  debug: 'text-purple-500',
};

// Extract initiator from stack trace
const extractInitiator = (stack?: string): string | undefined => {
  if (!stack) return undefined;
  try {
    const lines = stack.split('\n');
    // Skip first line (error message) and second line (our intercept function)
    if (lines.length > 2) {
      const callerLine = lines[2] || lines[1];
      // Extract file and line number
      const match = callerLine.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)/);
      if (match) {
        const [, functionName, file, line] = match;
        const fileName = file.split('/').pop() || file;
        return `${functionName || 'anonymous'} (${fileName}:${line})`;
      }
    }
  } catch {
    // Ignore parsing errors
  }
  return undefined;
};

// Group logs by message and type to stack repeats
const groupedLogs = computed<GroupedLog[]>(() => {
  const groups = new Map<string, GroupedLog>();
  
  for (const log of consoleLogs.value) {
    // Create a key from message and type (and initiator if available)
    const key = `${log.type}:${log.message}:${log.initiator || 'unknown'}`;
    
    if (groups.has(key)) {
      const existing = groups.get(key)!;
      existing.count++;
      existing.lastTimestamp = log.timestamp;
      // Merge data arrays
      if (log.data && log.data.length > 0) {
        if (!existing.data) {
          existing.data = [];
        }
        existing.data.push(...log.data);
      }
    } else {
      groups.set(key, {
        ...log,
        count: 1,
        firstTimestamp: log.timestamp,
        lastTimestamp: log.timestamp,
      });
    }
  }
  
  return Array.from(groups.values()).sort((a, b) => a.firstTimestamp - b.firstTimestamp);
});

// Filter grouped logs by type
const filteredGroupedLogs = (types: string[]) => {
  return computed(() => {
    return groupedLogs.value.filter(log => types.includes(log.type));
  }).value;
};

// Count logs by type
const allLogCount = computed(() => groupedLogs.value.length);
const messageCount = computed(() => groupedLogs.value.filter(l => ['log', 'info', 'debug'].includes(l.type)).length);
const warningCount = computed(() => groupedLogs.value.filter(l => l.type === 'warn').length);
const errorCount = computed(() => groupedLogs.value.filter(l => l.type === 'error').length);

// Open log modal
const openLogModal = (log: GroupedLog) => {
  selectedLog.value = log;
  logModalOpen.value = true;
};

// Check if running in Tauri - also check in browser for testing
const isTauri = computed(() => {
  // Check multiple ways to detect Tauri
  return !!(import.meta.env?.TAURI_PLATFORM || 
            (typeof window !== 'undefined' && (window as any).__TAURI__) ||
            (typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__));
});

// Store original console methods
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};

// Intercept console methods
const interceptConsole = () => {
  const addLog = (type: string, ...args: any[]) => {
    const message = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');

    const data = args.filter(arg => typeof arg === 'object');

    // Try to extract stack trace for initiator detection
    let stack: string | undefined;
    let initiator: string | undefined;
    try {
      throw new Error();
    } catch (e) {
      stack = (e as Error).stack;
      initiator = extractInitiator(stack);
    }

    // Capture stack trace for better debugging
    let fullStack: string | undefined = stack;
    if (!fullStack) {
      try {
        throw new Error();
      } catch (e) {
        fullStack = (e as Error).stack;
      }
    }

    consoleLogs.value.push({
      type,
      message,
      data: data.length > 0 ? data : undefined,
      timestamp: Date.now(),
      initiator,
      stack: fullStack,
    });

    // Keep only the last maxLogs entries
    if (consoleLogs.value.length > maxLogs) {
      consoleLogs.value = consoleLogs.value.slice(-maxLogs);
    }

    // Auto-scroll to bottom if enabled
    if (autoScroll.value) {
      nextTick(() => {
        scrollToBottom();
      });
    }

    // Also call original console method
    originalConsole[type as keyof typeof originalConsole]?.(...args);
  };

  console.log = (...args: any[]) => addLog('log', ...args);
  console.error = (...args: any[]) => addLog('error', ...args);
  console.warn = (...args: any[]) => addLog('warn', ...args);
  console.info = (...args: any[]) => addLog('info', ...args);
  console.debug = (...args: any[]) => addLog('debug', ...args);
};

// Restore original console methods
const restoreConsole = () => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
};

// Format log data for display
const formatLogData = (data: any[]): string => {
  return data.map(item => {
    try {
      return JSON.stringify(item, null, 2);
    } catch {
      return String(item);
    }
  }).join('\n');
};

// Scroll console to bottom
const scrollToBottom = () => {
  if (consoleContainerRef.value) {
    consoleContainerRef.value.scrollTop = consoleContainerRef.value.scrollHeight;
  }
};

// Clear logs
const clearLogs = () => {
  consoleLogs.value = [];
};

// Copy all logs to clipboard
const copyAllLogs = async () => {
  try {
    const logText = consoleLogs.value.map(log => {
      const timestamp = new Date(log.timestamp).toLocaleString();
      const dataText = log.data && log.data.length > 0 
        ? '\n' + log.data.map(d => JSON.stringify(d, null, 2)).join('\n')
        : '';
      return `[${timestamp}] ${log.type.toUpperCase()}: ${log.message}${dataText}`;
    }).join('\n\n');
    
    await navigator.clipboard.writeText(logText);
    console.info('All console logs copied to clipboard');
  } catch (error) {
    console.error('Failed to copy logs:', error);
  }
};

// Clear network requests
const clearNetworkRequests = () => {
  networkRequests.value = [];
};

// Open network modal
const openNetworkModal = (request: NetworkRequest) => {
  selectedNetworkRequest.value = request;
  networkModalOpen.value = true;
};

// Get network icon by method
const getNetworkIcon = (method: string) => {
  const methodIcons: Record<string, string> = {
    GET: 'lucide:download',
    POST: 'lucide:upload',
    PUT: 'lucide:edit',
    PATCH: 'lucide:edit-2',
    DELETE: 'lucide:trash-2',
    HEAD: 'lucide:search',
    OPTIONS: 'lucide:settings',
  };
  return methodIcons[method.toUpperCase()] || 'lucide:network';
};

// Get network status color
const getNetworkStatusColor = (status?: number) => {
  if (!status) return '';
  if (status >= 200 && status < 300) return 'text-green-600 dark:text-green-400';
  if (status >= 300 && status < 400) return 'text-blue-600 dark:text-blue-400';
  if (status >= 400) return 'text-red-600 dark:text-red-400';
  return '';
};

// Get network border color
const getNetworkBorderColor = (status?: number) => {
  if (!status) return 'border-l-gray-500 bg-muted/30';
  if (status >= 200 && status < 300) return 'border-l-green-500 bg-green-500/10';
  if (status >= 300 && status < 400) return 'border-l-blue-500 bg-blue-500/10';
  if (status >= 400) return 'border-l-red-500 bg-red-500/10';
  return 'border-l-gray-500 bg-muted/30';
};

// Get short URL for display
const getShortUrl = (url: string) => {
  try {
    const urlObj = new URL(url);
    return urlObj.pathname + urlObj.search;
  } catch {
    return url.length > 60 ? url.substring(0, 60) + '...' : url;
  }
};

// Sorted network requests (newest first)
const sortedNetworkRequests = computed(() => {
  return [...networkRequests.value].sort((a, b) => b.startTime - a.startTime);
});

// Format network body for display
const formatNetworkBody = (body: any): string => {
  if (!body) return '(empty)';
  if (typeof body === 'string') {
    try {
      const parsed = JSON.parse(body);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return body;
    }
  }
  if (typeof body === 'object') {
    return JSON.stringify(body, null, 2);
  }
  return String(body);
};

// Check devtools status (only when needed)
const checkDevtoolsStatus = async (showInConsole = false) => {
  if (!isTauri.value) return;
  const previousStatus = devtoolsOpen.value;
  
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const appWindow = getCurrentWindow();
    const newStatus = await appWindow.isDevtoolsOpen();
    devtoolsOpen.value = newStatus;
    
    // Only log if status changed or explicitly requested
    if (showInConsole && previousStatus !== newStatus) {
      if (newStatus) {
        console.info('Developer Tools opened');
      } else {
        console.info('Developer Tools closed');
      }
    }
    
    return newStatus;
  } catch (error) {
    devtoolsOpen.value = false;
    // Only log errors if they're meaningful and showInConsole is true
    if (showInConsole) {
      console.warn('Unable to check DevTools status:', error instanceof Error ? error.message : 'Unknown error');
    }
    return false;
  }
};

// Watch drawer to check status when it opens
watch(drawerOpen, async (isOpen) => {
  if (isOpen && isTauri.value) {
    // Check status and display in console when drawer opens
    await checkDevtoolsStatus(true);
  }
  // Auto-scroll console when drawer opens
  if (isOpen && autoScroll.value) {
    nextTick(() => {
      scrollToBottom();
    });
  }
});

// Intercept network requests
const interceptNetworkRequests = () => {
  // Intercept fetch
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const [url, options = {}] = args;
    const method = options.method || 'GET';
    const requestId = `fetch-${++requestIdCounter}`;
    const startTime = Date.now();
    
    // Process request body for logging
    let processedRequestBody: any = options.body;
    if (options.body) {
      if (options.body instanceof FormData) {
        // Convert FormData to object for display
        const formDataObj: Record<string, any> = {};
        options.body.forEach((value, key) => {
          formDataObj[key] = value;
        });
        processedRequestBody = formDataObj;
      } else if (options.body instanceof URLSearchParams) {
        processedRequestBody = Object.fromEntries(options.body.entries());
      } else if (typeof options.body === 'string') {
        try {
          processedRequestBody = JSON.parse(options.body);
        } catch {
          processedRequestBody = options.body;
        }
      }
    }

    const request: NetworkRequest = {
      id: requestId,
      method,
      url: typeof url === 'string' ? url : url.url || url.toString(),
      requestHeaders: options.headers ? Object.fromEntries(new Headers(options.headers as HeadersInit).entries()) : {},
      requestBody: processedRequestBody,
      type: 'fetch',
      startTime,
    };
    
    networkRequests.value.push(request);
    if (networkRequests.value.length > maxNetworkRequests) {
      networkRequests.value = networkRequests.value.slice(-maxNetworkRequests);
    }
    
    try {
      const response = await originalFetch(...args);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Clone response to read body without consuming it
      const clonedResponse = response.clone();
      
      // Try to read response body
      let responseBody: any;
      try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          responseBody = await clonedResponse.json();
        } else {
          responseBody = await clonedResponse.text();
        }
      } catch {
        responseBody = '(unable to read response body)';
      }
      
      // Update request with response data
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      
      request.endTime = endTime;
      request.duration = duration;
      request.status = response.status;
      request.statusText = response.statusText;
      request.responseHeaders = responseHeaders;
      request.responseBody = responseBody;
      
      return response;
    } catch (error: any) {
      const endTime = Date.now();
      request.endTime = endTime;
      request.duration = endTime - startTime;
      request.error = error.message || 'Network error';
      request.status = 0;
      throw error;
    }
  };
  
  // Intercept XMLHttpRequest
  const originalXHROpen = XMLHttpRequest.prototype.open;
  const originalXHRSend = XMLHttpRequest.prototype.send;
  
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...rest: any[]) {
    const requestId = `xhr-${++requestIdCounter}`;
    const startTime = Date.now();
    
    const request: NetworkRequest = {
      id: requestId,
      method,
      url: typeof url === 'string' ? url : url.toString(),
      type: 'xhr',
      startTime,
    };
    
    (this as any)._networkRequest = request;
    (this as any)._networkRequestId = requestId;
    
    networkRequests.value.push(request);
    if (networkRequests.value.length > maxNetworkRequests) {
      networkRequests.value = networkRequests.value.slice(-maxNetworkRequests);
    }
    
    return originalXHROpen.call(this, method, url as any, ...rest);
  };
  
  XMLHttpRequest.prototype.send = function(body?: any) {
    const request = (this as any)._networkRequest;
    if (request) {
      request.requestBody = body;
      
      // Capture request headers
      const requestHeaders: Record<string, string> = {};
      if ((this as any).getAllResponseHeaders) {
        // We can't get request headers directly, but we'll try to capture them
        // from the request object if available
      }
      request.requestHeaders = requestHeaders;
      
      // Capture response
      this.addEventListener('loadend', function() {
        const endTime = Date.now();
        request.endTime = endTime;
        request.duration = endTime - request.startTime;
        request.status = this.status;
        request.statusText = this.statusText;
        
        // Capture response headers
        const responseHeaders: Record<string, string> = {};
        const headers = this.getAllResponseHeaders();
        if (headers) {
          headers.split('\r\n').forEach(line => {
            const [key, value] = line.split(': ');
            if (key && value) {
              responseHeaders[key] = value;
            }
          });
        }
        request.responseHeaders = responseHeaders;
        
        // Try to capture response body
        try {
          const responseText = this.responseText;
          if (responseText) {
            try {
              request.responseBody = JSON.parse(responseText);
            } catch {
              request.responseBody = responseText;
            }
          }
        } catch {
          // Ignore errors reading response
        }
      });
      
      this.addEventListener('error', function() {
        const endTime = Date.now();
        request.endTime = endTime;
        request.duration = endTime - request.startTime;
        request.error = 'Network error';
        request.status = 0;
      });
    }
    
    return originalXHRSend.call(this, body);
  };
};

// Restore network interceptors
const restoreNetworkRequests = () => {
  // Note: This is tricky - we'd need to restore the original functions
  // For now, we'll just leave the interceptors active
  // In a real implementation, you'd store the original functions and restore them
};

onMounted(() => {
  // Intercept console methods
  interceptConsole();
  
  // Intercept network requests
  interceptNetworkRequests();
  
  // Check once on mount (silently - just for internal state)
  if (isTauri.value) {
    checkDevtoolsStatus(false);
  }
});

onUnmounted(() => {
  restoreConsole();
});

// Toggle devtools function
const toggleDevtools = async () => {
  if (!isTauri.value) {
    // In browser, we can't toggle devtools programmatically
    console.warn('DevTools toggle is only available in Tauri. Press F12 to open DevTools.');
    return;
  }
  
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const appWindow = getCurrentWindow();
    const wasOpen = await appWindow.isDevtoolsOpen();
    
    if (wasOpen) {
      await appWindow.closeDevtools();
      console.info('Closing Developer Tools...');
      devtoolsOpen.value = false;
    } else {
      await appWindow.openDevtools();
      console.info('Opening Developer Tools...');
      devtoolsOpen.value = true;
    }
    
    // Verify status after a short delay and log if changed
    setTimeout(async () => {
      const newStatus = await checkDevtoolsStatus(true);
      if (wasOpen !== newStatus) {
        console.info(`Developer Tools ${newStatus ? 'opened successfully' : 'closed successfully'}`);
      }
    }, 300);
  } catch (error) {
    console.error('Failed to toggle DevTools:', error instanceof Error ? error.message : 'Unknown error');
    // Fallback: try opening devtools directly
    try {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().openDevtools();
      console.info('Developer Tools opened (fallback method)');
      devtoolsOpen.value = true;
      setTimeout(async () => {
        await checkDevtoolsStatus(true);
      }, 300);
    } catch (err) {
      console.error('Fallback DevTools open failed:', err instanceof Error ? err.message : 'Unknown error');
      devtoolsOpen.value = false;
    }
  }
};

// Reload window function
const reloadWindow = async () => {
  console.info('Reloading window...');
  
  if (!isTauri.value) {
    window.location.reload();
    return;
  }
  
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    await getCurrentWindow().reload();
  } catch (error) {
    console.error('Failed to reload window:', error instanceof Error ? error.message : 'Unknown error');
    console.info('Falling back to window.location.reload()');
    window.location.reload();
  }
};

// Inspect element function (opens devtools)
const inspectElement = async () => {
  if (!isTauri.value) {
    console.info('Inspect element: Use browser DevTools (F12)');
    return;
  }
  
  try {
    const { getCurrentWindow } = await import('@tauri-apps/api/window');
    const appWindow = getCurrentWindow();
    const wasOpen = await appWindow.isDevtoolsOpen();
    
    if (!wasOpen) {
      await appWindow.openDevtools();
      console.info('Opening Developer Tools for inspection...');
      devtoolsOpen.value = true;
      
      // Verify and log status
      setTimeout(async () => {
        await checkDevtoolsStatus(true);
      }, 300);
    } else {
      console.info('Developer Tools already open');
      await checkDevtoolsStatus(true);
    }
  } catch (error) {
    console.error('Failed to open DevTools for inspection:', error instanceof Error ? error.message : 'Unknown error');
    devtoolsOpen.value = false;
  }
};

// Open devtools drawer
const openDevtoolsDrawer = () => {
  drawerOpen.value = true;
  menuOpen.value = false; // Close menu after opening drawer
};
</script>

<style scoped>
.menu {
  pointer-events: auto;
  position: relative;
}
</style>

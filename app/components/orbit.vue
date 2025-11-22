<template>
	<div
		ref="containerRef"
		class="w-full h-screen flex flex-col items-center justify-center overflow-hidden"
		tabindex="0"
		@click="handleContainerClick"
		@wheel="handleWheel"
		@mousedown="handleMouseDown"
		@mousemove="handleMouseMove"
		@mouseup="handleMouseUp"
		@keydown="handleKeyDown"
	>
		<div class="relative w-full max-w-4xl h-full flex flex-col items-center justify-center">
			<!-- Orbit Title Display -->
			<div class="absolute top-8 left-1/2 transform -translate-x-1/2 text-center z-20">
				<h1 class="text-3xl font-bold text-white mb-2">{{ orbitTitle }}</h1>
				<p class="text-white/60 text-sm">Interactive timeline with task management</p>
			</div>

			<!-- Controls Overlay - Top Right -->
			<div class="absolute top-4 right-4 bg-black/80 backdrop-blur-lg border border-white/30 rounded-lg p-3 text-white text-xs z-20">
				<div class="font-semibold mb-2">
					Controls
				</div>
				<div class="space-y-1">
					<div>🖱️ Drag to pan</div>
					<div>🔍 Scroll to zoom</div>
					<div>⏸️ Space to pause</div>
					<div>🔄 R to reset</div>
					<div class="mt-2 text-white/60">
						Zoom: {{ Math.round(zoomLevel * 100) }}%
					</div>
				</div>

				<!-- Ring Legend -->
				<div class="mt-3 pt-3 border-t border-white/20">
					<div class="font-semibold mb-2">Ring Structure</div>
					<div class="space-y-1 text-xs">
						<div class="flex items-center gap-2">
							<div class="w-3 h-3 rounded-full border border-white/40" style="background-color: rgba(59, 130, 246, 0.4)"></div>
							<span>Ring 1: {{ allTasks.length }} tasks</span>
						</div>
						<div class="flex items-center gap-2">
							<div class="w-3 h-3 rounded-full border border-white/40" style="background-color: rgba(34, 197, 94, 0.4)"></div>
							<span>In Progress: {{ inProgressTasks.length }} tasks</span>
						</div>
					</div>
				</div>
			</div>

			<div
				ref="orbitRef"
				class="absolute w-full h-full flex items-center justify-center"
				:style="{
					perspective: '1000px',
					transform: `translate(${centerOffset.x}px, ${centerOffset.y}px) scale(${zoomLevel})`
				}"
			>
				<!-- Centered Coordinate System Wrapper -->
				<div class="absolute left-1/2 top-1/2 w-0 h-0">
					<!-- Central Hub with Image Upload -->
					<div class="absolute w-16 h-16 rounded-full animate-pulse flex items-center justify-center z-10 cursor-pointer" 
						:style="{ 
							transform: 'translate(-50%, -50%)',
							background: centerIconImage ? 'transparent' : (centerIconColor || 'linear-gradient(to bottom right, #8b5cf6, #3b82f6, #14b8a6)')
						}"
						@dblclick="openCenterCustomizationModal">
						<div class="absolute w-20 h-20 rounded-full border border-white/20 animate-ping opacity-70" />
						<div
							class="absolute w-24 h-24 rounded-full border border-white/10 animate-ping opacity-50"
							style="animation-delay: 0.5s"
						/>

						<!-- Center Icon Image or Default -->
						<div v-if="centerIconImage" class="w-8 h-8 rounded-full overflow-hidden">
							<img :src="centerIconImage" alt="Center Icon" class="w-full h-full object-cover" />
						</div>
						<div v-else class="w-8 h-8 rounded-full backdrop-blur-md" :style="{ backgroundColor: centerIconColor || '#ffffff' }" />
						
						<!-- Hover Tooltip -->
						<div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
							Double-click to customize
						</div>
					</div>

					<!-- Center Point Indicator -->
					<div class="absolute w-2 h-2 bg-red-500 rounded-full z-20" style="transform: translate(-50%, -50%);" />

					<!-- Single Orbital Ring -->
					<div
						class="absolute rounded-full border border-white/30 ring-1"
						:style="{
							width: '400px',
							height: '400px',
							left: '50%',
							top: '50%',
							transform: 'translate(-50%, -50%)',
							opacity: 0.3,
							boxShadow: '0 0 60px rgba(59, 130, 246, 0.3)'
						}"
					/>

					<!-- Timeline Nodes (All Tasks) -->
					<div
						v-for="(item, index) in allTasks"
						:key="item.id"
						:ref="(el) => setNodeRef(item.id, el)"
						class="transition-all duration-700 cursor-pointer"
						:style="getNodeStyle(index)"
						@click.stop="toggleItem(item.id)"
					>
						<!-- Energy Pulse Effect -->
						<div
							class="absolute rounded-full -inset-1"
							:class="{ 'animate-pulse duration-1000': pulseEffect[item.id] }"
							:style="getEnergyPulseStyle(item.energy)"
						/>

						<!-- Node Icon with Image Upload -->
						<div
							:class="getNodeIconClasses(item.id)"
						>
							<!-- Task Icon Image or Default -->
							<div v-if="taskIconImages[item.id]" class="w-4 h-4 rounded-sm overflow-hidden">
								<img :src="taskIconImages[item.id] || ''" alt="Task Icon" class="w-full h-full object-cover" />
							</div>
							<div v-else class="w-4 h-4 rounded-sm" :style="{ backgroundColor: taskIconColors[item.id] || '#ffffff' }" />
						</div>

						<!-- User assignment indicator on node -->
						<div v-if="item.assignedUsers && item.assignedUsers.length > 0" class="absolute top-14 left-1/2 -translate-x-1/2 flex items-center gap-1">
							<User :size="8" class="text-white/60" />
							<span class="text-xs text-white/60 font-mono">
								{{ item.assignedUsers.length }}
							</span>
						</div>

						<!-- User Assignment Icon - Double click to show modal -->
						<div class="absolute top-2 right-2 group">
							<!-- User Icon Button -->
							<button
								class="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 border border-white/30 flex items-center justify-center transition-all duration-200 hover:scale-110"
								@dblclick.stop="toggleUserAssignmentModal(item.id)"
							>
								<User :size="16" class="text-white/80" />
							</button>

							<!-- Hover Tooltip -->
							<div class="absolute bottom-full right-0 mb-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
								Double-click to assign users ({{ item.assignedUsers?.length || 0 }} assigned)
							</div>
						</div>

						<!-- User Assignment Modal -->
						<div
							v-if="showUserAssignmentModal[item.id]"
							class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
							@click.stop="closeUserAssignmentModal(item.id)"
						>
							<div
								class="bg-black/95 border border-white/30 rounded-lg p-6 w-96 max-w-sm mx-4 max-h-[90vh] overflow-y-auto"
								@click.stop
							>
								<!-- Modal Header -->
								<div class="flex items-center justify-between mb-4">
									<h3 class="text-lg font-semibold text-white">Customize Task</h3>
									<button
										class="text-white/60 hover:text-white transition-colors"
										@click="closeUserAssignmentModal(item.id)"
									>
										×
									</button>
								</div>

								<!-- Task Info -->
								<div class="mb-4 p-3 bg-white/5 rounded border border-white/20">
									<h4 class="text-sm font-medium text-white mb-1">{{ item.title }}</h4>
									<p class="text-xs text-white/60">Currently assigned: {{ item.assignedUsers?.length || 0 }} users</p>
								</div>

								<!-- Task Icon Customization Section -->
								<div class="mb-6 p-4 bg-white/5 rounded border border-white/20">
									<h4 class="text-sm font-medium text-white/80 mb-3">Task Icon</h4>
									
									<!-- Current Icon Display -->
									<div class="flex items-center gap-3 mb-3">
										<div class="w-8 h-8 rounded-sm overflow-hidden border border-white/30">
											<div v-if="taskIconImages[item.id]" class="w-full h-full">
												<img :src="taskIconImages[item.id] || ''" alt="Task Icon" class="w-full h-full object-cover" />
											</div>
											<div v-else class="w-full h-full" :style="{ backgroundColor: taskIconColors[item.id] || '#ffffff' }" />
										</div>
										<span class="text-xs text-white/60">Current icon</span>
									</div>

									<!-- Image Upload -->
									<div class="mb-3">
										<label class="block text-xs font-medium text-white/70 mb-2">Upload Image</label>
										<input
											type="file"
											accept="image/*"
											class="w-full text-xs text-white/60 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-white/20 file:text-white hover:file:bg-white/30"
											@change="(event) => handleTaskImageUpload(item.id, event)"
										/>
									</div>

									<!-- Color Selection -->
									<div class="mb-3">
										<label class="block text-xs font-medium text-white/70 mb-2">Or Choose Color</label>
										<div class="grid grid-cols-6 gap-2">
											<button
												v-for="color in predefinedColors"
												:key="color"
												class="w-6 h-6 rounded border-2 transition-all hover:scale-110"
												:class="taskIconColors[item.id] === color ? 'border-white scale-110' : 'border-white/30'"
												:style="{ backgroundColor: color }"
												@click="setTaskIconColor(item.id, color)"
											/>
										</div>
									</div>

									<!-- Remove Customization -->
									<div class="flex justify-between items-center">
										<button
											v-if="taskIconImages[item.id] || taskIconColors[item.id]"
											class="text-xs px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded border border-red-500/30 transition-colors"
											@click="removeTaskIconCustomization(item.id)"
										>
											Reset to Default
										</button>
										<button
											class="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 text-white/70 rounded border border-white/30 transition-colors"
											@click="generateRandomTaskColor(item.id)"
										>
											Random Color
										</button>
									</div>
								</div>

								<!-- User Assignment Section -->
								<div class="mb-4">
									<h4 class="text-sm font-medium text-white/80 mb-3">Assign Users</h4>
									
									<!-- User Selection -->
									<div class="mb-3">
										<label class="block text-xs font-medium text-white/70 mb-2">Select User</label>
										<select
											v-model="newUserAssignment[item.id]"
											class="w-full px-3 py-2 bg-white/10 border border-white/30 rounded text-white text-sm focus:outline-none focus:border-white/50"
										>
											<option value="">Choose a user...</option>
											<option
												v-for="user in item.availableUsers"
												:key="user.id"
												:value="user.id"
												:disabled="item.assignedUsers?.includes(user.id)"
											>
												{{ user.name || user.username || user.email }}
												{{ item.assignedUsers?.includes(user.id) ? ' (Already assigned)' : '' }}
											</option>
										</select>
									</div>

									<!-- Action Buttons -->
									<div class="flex gap-3">
										<button
											:disabled="!newUserAssignment[item.id]?.trim() || isAssigningUser[item.id]"
											class="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
											@click="assignUserToTask(item.id)"
										>
											{{ isAssigningUser[item.id] ? 'Assigning...' : 'Assign User' }}
										</button>
									</div>

									<!-- Assigned Users List -->
									<div v-if="item.assignedUsers && item.assignedUsers.length > 0" class="mt-4 pt-3 border-t border-white/20">
										<h4 class="text-xs font-medium text-white/70 mb-2">Assigned Users</h4>
										<div class="space-y-2">
											<div
												v-for="userId in item.assignedUsers"
												:key="userId"
												class="flex items-center justify-between p-2 bg-white/5 rounded border border-white/20"
											>
												<div class="flex items-center gap-2">
													<div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
														<span class="text-xs text-white font-medium">
															{{ getUserInitials(userId, item.availableUsers) }}
														</span>
													</div>
													<span class="text-sm text-white">
														{{ getUserName(userId, item.availableUsers) }}
													</span>
												</div>
												<button
													class="text-red-400 hover:text-red-300 hover:bg-red-400/10 p-1 rounded transition-all"
													@click="removeUserFromTask(item.id, userId)"
												>
													×
												</button>
											</div>
										</div>
									</div>
								</div>

								<!-- Close Button -->
								<div class="flex justify-end">
									<button
										class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded font-medium transition-colors"
										@click="closeUserAssignmentModal(item.id)"
									>
										Close
									</button>
								</div>
							</div>
						</div>

						<!-- Node Title -->
						<div
							:class="getNodeTitleClasses(item.id)"
						>
							{{ item.title }}
						</div>

						<!-- Subtask Orbits -->
						<div
							v-if="item.subtasks && item.subtasks.length > 0"
							class="absolute w-48 h-48"
							:style="getSubtaskOrbitStyle()"
						>
							<div
								v-for="(subtask, subtaskIndex) in item.subtasks"
								:key="subtask.id"
								:style="getSubtaskPosition(subtaskIndex, item.subtasks.length)"
								class="absolute w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white/30 shadow-lg shadow-blue-500/30 flex items-center justify-center cursor-pointer transition-all duration-300 hover:scale-125" :class="[
									`subtask-orbit-${subtaskIndex + 1}`
								]"
								@click.stop="toggleSubtaskForm(item.id)"
							>
								<div class="w-1.5 h-1.5 rounded-full bg-white" />
								<!-- Subtask Tooltip -->
								<div class="absolute bottom-6 left-1/2 -translate-x-1/2 w-28 bg-black/90 backdrop-blur-lg border border-white/30 rounded-lg shadow-xl shadow-white/10 p-2 text-xs text-white opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
									<div class="font-medium">
										{{ subtask.title }}
									</div>
									<div class="text-white/60">
										{{ subtask.status }}
									</div>
								</div>
							</div>
						</div>

						<!-- Expanded Card -->
						<div
							v-if="expandedItems[item.id]"
							class="expanded-card absolute top-20 left-1/2 -translate-x-1/2 w-64 bg-black/90 backdrop-blur-lg border border-white/30 rounded-lg shadow-xl shadow-white/10 overflow-visible"
						>
							<!-- Connection Line -->
							<div class="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/50" />

							<!-- Card Header -->
							<div class="flex flex-col space-y-1.5 p-6 pb-2">
								<div class="flex justify-between items-center">
									<div
										:class="getStatusBadgeClasses(item.status)"
										class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold"
									>
										{{ getStatusText(item.status) }}
									</div>
									<span class="text-xs font-mono text-white/50">
										{{ item.date }}
									</span>
								</div>
								<div class="flex items-center gap-2 mt-2">
									<h3 class="text-2xl font-semibold leading-none tracking-tight text-white">
										{{ item.title }}
									</h3>
									<!-- User assignment indicator -->
									<div v-if="item.assignedUsers && item.assignedUsers.length > 0" class="flex items-center gap-1">
										<User :size="12" class="text-white/60" />
										<span class="text-xs text-white/60 font-mono">
											{{ item.assignedUsers.length }}
										</span>
									</div>
								</div>
							</div>

							<!-- Card Content -->
							<div class="p-6 pt-0 text-xs text-white/80">
								<p>{{ item.content }}</p>

								<!-- Energy Level -->
								<div class="mt-4 pt-3 border-t border-white/10">
									<div class="flex justify-between items-center text-xs mb-1">
										<span class="flex items-center">
											<Zap :size="10" class="mr-1" />
											Energy Level
										</span>
										<span class="font-mono">{{ item.energy }}%</span>
									</div>
									<div class="w-full h-1 bg-white/10 rounded-full overflow-hidden">
										<div
											class="h-full bg-gradient-to-r from-blue-500 to-purple-500"
											:style="{ width: `${item.energy}%` }"
										/>
									</div>
								</div>

								<!-- Related Nodes -->
								<div v-if="item.relatedIds.length > 0" class="mt-4 pt-3 border-t border-white/10">
									<div class="flex items-center mb-2">
										<Link :size="10" class="text-white/70 mr-1" />
										<h4 class="text-xs uppercase tracking-wider font-medium text-white/70">
											Connected Nodes
										</h4>
									</div>
									<div class="flex flex-wrap gap-1">
										<button
											v-for="relatedId in item.relatedIds"
											:key="relatedId"
											class="flex items-center h-6 px-2 py-0 text-xs rounded-none border border-white/20 bg-transparent hover:bg-white/10 text-white/80 hover:text-white transition-all"
											@click.stop="toggleItem(relatedId)"
										>
											{{ getRelatedItemTitle(relatedId) }}
											<ArrowRight :size="8" class="ml-1 text-white/60" />
										</button>
									</div>
								</div>

								<!-- Subtasks Section -->
								<div class="subtask-form mt-4 pt-3 border-t border-white/10">
									<div class="flex items-center justify-between mb-3">
										<h4 class="text-xs uppercase tracking-wider font-medium text-white/70">
											Subtasks
										</h4>
										<button
											class="text-xs px-2 py-1 rounded border border-white/30 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
											@click.stop="toggleSubtaskForm(item.id, $event)"
										>
											{{ showSubtaskForm[item.id] ? 'Cancel' : 'Add Subtask' }}
										</button>
									</div>

									<!-- Add Subtask Form -->
									<div v-if="showSubtaskForm[item.id]" class="subtask-form mb-3 p-3 bg-white/5 rounded border border-white/20">
										<input
											v-model="newSubtaskTitle[item.id]"
											type="text"
											placeholder="Subtask title"
											class="w-full mb-2 px-2 py-1 text-xs bg-black/50 border border-white/30 rounded text-white placeholder-white/50"
											@click.stop
											@mousedown.stop
										>
										<textarea
											v-model="newSubtaskDescription[item.id]"
											placeholder="Description (optional)"
											class="w-full mb-2 px-2 py-1 text-xs bg-black/50 border border-white/30 rounded text-white placeholder-white/50 resize-none"
											rows="2"
											@click.stop
											@mousedown.stop
										/>
										<button
											:disabled="!newSubtaskTitle[item.id]?.trim()"
											class="w-full px-3 py-1 text-xs bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded transition-all"
											@click.stop="addSubtask(item.id)"
										>
											Add Subtask
										</button>
									</div>

									<!-- Subtasks List -->
									<div v-if="item.subtasks && item.subtasks.length > 0" class="space-y-2">
										<div
											v-for="subtask in item.subtasks"
											:key="subtask.id"
											class="flex items-center justify-between p-2 bg-white/5 rounded border border-white/20"
										>
											<div class="flex-1">
												<div class="flex items-center gap-2 mb-1">
													<span class="text-xs font-medium text-white">{{ subtask.title }}</span>
													<select
														:value="subtask.status"
														class="text-xs px-1 py-0.5 bg-black/50 border border-white/30 rounded text-white"
														@change="(e) => updateSubtaskStatus(item.id, subtask.id, (e.target as HTMLSelectElement).value as 'pending' | 'in-progress' | 'completed')"
													>
														<option value="pending">
															Pending
														</option>
														<option value="in-progress">
															In Progress
														</option>
														<option value="completed">
															Completed
														</option>
													</select>
												</div>
												<p v-if="subtask.description" class="text-xs text-white/60">
													{{ subtask.description }}
												</p>
											</div>
											<button
												class="ml-2 px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-all"
												@click.stop="deleteSubtask(item.id, subtask.id)"
											>
												×
											</button>
										</div>
									</div>
									<div v-else class="text-xs text-white/40 italic">
										No subtasks yet
									</div>
								</div>

								<!-- User Assignment Section -->
								<div class="user-assignment mt-4 pt-3 border-t border-white/10">
									<div class="flex items-center justify-between mb-3">
										<h4 class="text-xs uppercase tracking-wider font-medium text-white/70 flex items-center gap-2">
											<User :size="10" class="text-white/70" />
											Assigned Users
										</h4>
										<button
											class="text-xs px-2 py-1 rounded border border-white/30 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
											@click.stop="toggleUserAssignmentModal(item.id)"
										>
											Assign User
										</button>
									</div>

									<!-- Assigned Users List -->
									<div v-if="item.assignedUsers && item.assignedUsers.length > 0" class="space-y-2">
										<div
											v-for="userId in item.assignedUsers"
											:key="userId"
											class="flex items-center justify-between p-2 bg-white/5 rounded border border-white/20"
										>
											<div class="flex items-center gap-2">
												<div class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
													<span class="text-xs text-white font-medium">
														{{ getUserInitials(userId, item.availableUsers) }}
													</span>
												</div>
												<span class="text-xs text-white">
													{{ getUserName(userId, item.availableUsers) }}
												</span>
											</div>
											<button
												class="ml-2 px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-all"
												@click.stop="removeUserFromTask(item.id, userId)"
											>
												×
											</button>
										</div>
									</div>
									<div v-else class="text-xs text-white/40 italic">
										No users assigned yet
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Center Icon Customization Modal -->
		<div
			v-if="showCenterCustomizationModal"
			class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
			@click.stop="closeCenterCustomizationModal"
		>
			<div
				class="bg-black/95 border border-white/30 rounded-lg p-6 w-96 max-w-sm mx-4 max-h-[90vh] overflow-y-auto"
				@click.stop
			>
				<!-- Modal Header -->
				<div class="flex items-center justify-between mb-4">
					<h3 class="text-lg font-semibold text-white">Customize Center Icon</h3>
					<button
						class="text-white/60 hover:text-white transition-colors"
						@click="closeCenterCustomizationModal"
					>
						×
					</button>
				</div>

				<!-- Orbit Title -->
				<div class="mb-4">
					<label class="block text-sm font-medium text-white/80 mb-2">Orbit Title</label>
					<input
						v-model="orbitTitle"
						type="text"
						placeholder="Enter orbit title..."
						class="w-full px-3 py-2 bg-white/10 border border-white/30 rounded text-white text-sm focus:outline-none focus:border-white/50 placeholder-white/40"
					/>
				</div>

				<!-- Current Icon Display -->
				<div class="flex items-center gap-3 mb-3">
					<div class="w-12 h-12 rounded-md overflow-hidden border border-white/30">
						<div v-if="centerIconImage" class="w-full h-full">
							<img :src="centerIconImage" alt="Center Icon" class="w-full h-full object-cover" />
						</div>
						<div v-else class="w-full h-full" :style="{ backgroundColor: centerIconColor || '#ffffff' }" />
					</div>
					<span class="text-xs text-white/60">Current icon</span>
				</div>

				<!-- Image Upload -->
				<div class="mb-3">
					<label class="block text-xs font-medium text-white/70 mb-2">Upload Image</label>
					<input
						type="file"
						accept="image/*"
						class="w-full text-xs text-white/60 file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-white/20 file:text-white hover:file:bg-white/30"
						@change="(event) => handleCenterImageUpload(event)"
					/>
				</div>

				<!-- Color Selection -->
				<div class="mb-3">
					<label class="block text-xs font-medium text-white/70 mb-2">Or Choose Color</label>
					<div class="grid grid-cols-6 gap-2">
						<button
							v-for="color in predefinedColors"
							:key="color"
							class="w-6 h-6 rounded border-2 transition-all hover:scale-110"
							:class="centerIconColor === color ? 'border-white scale-110' : 'border-white/30'"
							:style="{ backgroundColor: color }"
							@click="setCenterIconColor(color)"
						/>
					</div>
				</div>

				<!-- Remove Customization -->
				<div class="flex justify-between items-center">
					<button
						v-if="centerIconImage || centerIconColor"
						class="text-xs px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded border border-red-500/30 transition-colors"
						@click="removeCenterIconCustomization"
					>
						Reset to Default
					</button>
					<button
						class="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 text-white/70 rounded border border-white/30 transition-colors"
						@click="generateRandomCenterIconColor"
					>
						Random Color
					</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { ArrowRight, Link, User, Zap } from "lucide-vue-next";
	import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";

	interface TimelineItem {
		id: number
		taskId?: string // Reference to original task ID
		title: string
		date: string
		content: string
		category: string
		icon: any
		relatedIds: number[]
		status: "completed" | "in-progress" | "pending"
		energy: number
		subtasks?: Subtask[]
		assignedUsers?: string[] // Array of assigned user IDs
		availableUsers?: any[] // Array of available users for assignment
	}

	interface Subtask {
		id: number
		title: string
		description: string
		status: "pending" | "in-progress" | "completed"
		energy: number
	}

	interface Props {
		timelineData: TimelineItem[]
		autoRotate?: boolean
		orbitTitle?: string
		rotationSpeed?: number
		zoomLevel?: number
		centerIconColor?: string
	}

	const props = defineProps<Props>();
	const emit = defineEmits<{
		"user-assigned": [taskId: string, userId: string]
		"user-removed": [taskId: string, userId: string]
		"timeline-reordered": [newTimelineData: any[]]
	}>();

	// Reactive state
	const expandedItems = ref<Record<number, boolean>>({});
	const viewMode = ref<"orbital">("orbital");
	const rotationAngle = ref<number>(0);
	const autoRotate = ref<boolean>(props.autoRotate ?? false); // Use prop or default to false
	const pulseEffect = ref<Record<number, boolean>>({});
	const centerOffset = reactive({ x: 0, y: 0 });
	const activeNodeId = ref<number | null>(null);
	const showSubtaskForm = ref<Record<number, boolean>>({});
	const newSubtaskTitle = ref<Record<number, string>>({});
	const newSubtaskDescription = ref<Record<number, string>>({});
	const zoomLevel = ref<number>(props.zoomLevel ?? 1);
	const isDragging = ref<boolean>(false);
	const lastMousePos = reactive({ x: 0, y: 0 });

	// User assignment state
	const newUserAssignment = ref<Record<number, string>>({});
	const isAssigningUser = ref<Record<number, boolean>>({});
	const showUserAssignmentModal = ref<Record<number, boolean>>({});

	// Template refs
	const containerRef = ref<HTMLDivElement>();
	const orbitRef = ref<HTMLDivElement>();
	const nodeRefs = ref<Record<number, HTMLDivElement | null>>({});
	const centerImageInput = ref<HTMLInputElement | null>(null);
	const taskIconInputs = ref<Record<number, HTMLInputElement | null>>({});

	// State for images
	const centerIconImage = ref<string | null>(null);
	const centerIconColor = ref<string | null>(props.centerIconColor ?? null); // Use prop or default to null
	const taskIconImages = ref<Record<number, string | null>>({});
	const taskIconColors = ref<Record<number, string>>({}); // New state for task icon colors

	// Orbit title
	const orbitTitle = ref<string>(props.orbitTitle ?? "Tasks Orbit View");

	// Predefined colors for icon customization
	const predefinedColors = [
		"#FF6B6B",
		"#4CAF50",
		"#2196F3",
		"#9C27B0",
		"#FF9800",
		"#795548",
		"#607D8B",
		"#E91E63",
		"#00BCD4",
		"#CDDC39",
		"#FF5722",
		"#3F51B5"
	];

	// Timer for auto-rotation
	let rotationTimer: NodeJS.Timeout | null = null;

	// Methods
	const handleContainerClick = (e: MouseEvent) => {
		// Only close cards when clicking on the background, not on cards or forms
		if (e.target === containerRef.value || e.target === orbitRef.value) {
			// Check if we're clicking on a card or form element
			const target = e.target as HTMLElement;
			if (target.closest(".expanded-card") || target.closest(".subtask-form")) {
				return; // Don't close if clicking on card content
			}

			expandedItems.value = {};
			activeNodeId.value = null;
			pulseEffect.value = {};
			autoRotate.value = true;
		}
	};

	const handleWheel = (e: WheelEvent) => {
		e.preventDefault();
		const delta = e.deltaY > 0 ? 0.9 : 1.1;
		zoomLevel.value = Math.max(0.5, Math.min(3, zoomLevel.value * delta));
	};

	const handleMouseDown = (e: MouseEvent) => {
		if (e.button === 0) { // Left mouse button
			isDragging.value = true;
			lastMousePos.x = e.clientX;
			lastMousePos.y = e.clientY;
			autoRotate.value = false; // Pause rotation when dragging
		}
	};

	const handleMouseMove = (e: MouseEvent) => {
		if (isDragging.value) {
			const deltaX = e.clientX - lastMousePos.x;
			const deltaY = e.clientY - lastMousePos.y;

			centerOffset.x += deltaX;
			centerOffset.y += deltaY;

			lastMousePos.x = e.clientX;
			lastMousePos.y = e.clientY;
		}
	};

	const handleMouseUp = () => {
		isDragging.value = false;
		// Resume rotation after a delay
		setTimeout(() => {
			if (!isDragging.value) {
				autoRotate.value = true;
			}
		}, 1000);
	};

	const handleKeyDown = (e: KeyboardEvent) => {
		if (e.key === " ") {
			e.preventDefault();
			autoRotate.value = !autoRotate.value;
		} else if (e.key === "r" || e.key === "R") {
			e.preventDefault();
			// Reset view
			centerOffset.x = 0;
			centerOffset.y = 0;
			zoomLevel.value = 1;
			rotationAngle.value = 0;
		}
	};

	const setNodeRef = (id: number, el: any) => {
		if (el) {
			nodeRefs.value[id] = el;
		}
	};

	const toggleItem = (id: number) => {
		const newExpandedItems = { ...expandedItems.value };

		// Close all other items
		Object.keys(newExpandedItems).forEach((key) => {
			if (Number.parseInt(key) !== id) {
				newExpandedItems[Number.parseInt(key)] = false;
			}
		});

		newExpandedItems[id] = !expandedItems.value[id];
		expandedItems.value = newExpandedItems;

		if (newExpandedItems[id]) {
			activeNodeId.value = id;
			autoRotate.value = false; // Pause rotation when task is expanded

			const relatedItems = getRelatedItems(id);
			const newPulseEffect: Record<number, boolean> = {};
			relatedItems.forEach((relId) => {
				newPulseEffect[relId] = true;
			});
			pulseEffect.value = newPulseEffect;

			centerViewOnNode(id);
		} else {
			activeNodeId.value = null;
			// Resume rotation after a delay
			setTimeout(() => {
				if (!activeNodeId.value) {
					autoRotate.value = true;
				}
			}, 1000);
			pulseEffect.value = {};
		}
	};

	const centerViewOnNode = (nodeId: number) => {
		if (viewMode.value !== "orbital" || !nodeRefs.value[nodeId]) return;

		const nodeIndex = props.timelineData.findIndex((item) => item.id === nodeId);
		const totalNodes = props.timelineData.length;
		const targetAngle = (nodeIndex / totalNodes) * 360;

		rotationAngle.value = 270 - targetAngle;
	};

	const calculateNodePosition = (index: number, total: number) => {
		// Single ring with maximum 10 tasks
		const maxTasks = Math.min(total, 10);
		const positionInRing = index % maxTasks;

		// Single ring radius
		const radius = 200;

		// Ring rotation speed
		const ringRotationAngle = rotationAngle.value % 360;

		// Calculate angle within the ring
		const angle = ((positionInRing / maxTasks) * 360 + ringRotationAngle) % 360;
		const radian = (angle * Math.PI) / 180;

		// Calculate position on the circular path
		const x = radius * Math.cos(radian);
		const y = radius * Math.sin(radian);

		// Z-index and opacity
		const zIndex = 100;
		const opacity = 1;

		return { x, y, angle, zIndex, opacity, ringIndex: 0 };
	};

	const getRelatedItems = (itemId: number): number[] => {
		const currentItem = props.timelineData.find((item) => item.id === itemId);
		return currentItem ? currentItem.relatedIds : [];
	};

	const isRelatedToActive = (itemId: number): boolean => {
		if (!activeNodeId.value) return false;
		const relatedItems = getRelatedItems(activeNodeId.value);
		return relatedItems.includes(itemId);
	};

	const getRelatedItemTitle = (relatedId: number): string => {
		const relatedItem = props.timelineData.find((i) => i.id === relatedId);
		return relatedItem?.title || "";
	};

	// Move task to top when status changes
	const moveTaskToTop = (taskId: string) => {
		// Find the task in timelineData and move it to the top
		const taskIndex = props.timelineData.findIndex(item => item.taskId === taskId);
		if (taskIndex > 0) {
			// Reorder the timelineData to move this task to the top
			const task = props.timelineData[taskIndex];
			const newTimelineData = [task, ...props.timelineData.filter((_, index) => index !== taskIndex)];
			
			// Emit the reordered data back to parent
			emit('timeline-reordered', newTimelineData);
		}
	};

	// Computed properties
	const inProgressTasks = computed(() => {
		return props.timelineData
			.filter((item) => item.status === "in-progress")
			.slice(0, 10); // Maximum 10 tasks
	});

	// All tasks for orbit display (not just in-progress)
	const allTasks = computed(() => {
		console.log('🌌 Orbit component allTasks:', props.timelineData);
		return props.timelineData.slice(0, 20); // Maximum 20 tasks
	});

	// Computed styles and classes
	const getNodeStyle = (index: number) => {
		const position = calculateNodePosition(index, allTasks.value.length);
		const item = allTasks.value[index];
		const isExpanded = item ? expandedItems.value[item.id] : false;

		return {
			position: 'absolute' as const,
			left: `${position.x}px`,
			top: `${position.y}px`,
			zIndex: isExpanded ? 200 : position.zIndex,
			opacity: isExpanded ? 1 : position.opacity
		};
	};

	const getEnergyPulseStyle = (energy: number) => {
		const size = energy * 0.5 + 40;
		return {
			background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)`,
			width: `${size}px`,
			height: `${size}px`,
			left: `-${(size - 40) / 2}px`,
			top: `-${(size - 40) / 2}px`
		};
	};

	const getNodeIconClasses = (itemId: number) => {
		const isExpanded = expandedItems.value[itemId];
		const isRelated = isRelatedToActive(itemId);
		const item = props.timelineData.find(i => i.id === itemId);
		const status = item?.status || 'pending';

		// Status-based colors
		const getStatusColor = (status: string) => {
			switch (status) {
				case 'in-progress': return 'bg-primary text-white border-primary shadow-lg shadow-primary/30';
				case 'completed': return 'bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/30';
				case 'pending': return 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/30';
				default: return 'bg-gray-500 text-white border-gray-500 shadow-lg shadow-gray-500/30';
			}
		};

		return [
			"w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 transform",
			{
				"scale-150": isExpanded,
				"animate-pulse": !isExpanded && isRelated,
				[getStatusColor(status)]: !isExpanded && !isRelated
			}
		];
	};

	const getNodeTitleClasses = (itemId: number) => {
		const isExpanded = expandedItems.value[itemId];

		return [
			"absolute top-12 whitespace-nowrap text-xs font-semibold tracking-wider transition-all duration-300",
			{
				"text-white scale-125": isExpanded,
				"text-white/70": !isExpanded
			}
		];
	};

	const getStatusBadgeClasses = (status: TimelineItem["status"]) => {
		switch (status) {
		case "completed":
			return "text-white bg-black border-white";
		case "in-progress":
			return "text-black bg-white border-black";
		case "pending":
			return "text-white bg-black/40 border-white/50";
		default:
			return "text-white bg-black/40 border-white/50";
		}
	};

	const getStatusText = (status: TimelineItem["status"]) => {
		switch (status) {
		case "completed":
			return "COMPLETE";
		case "in-progress":
			return "IN PROGRESS";
		case "pending":
			return "PENDING";
		default:
			return "PENDING";
		}
	};

	// Subtask management methods
	const toggleSubtaskForm = (itemId: number, event?: Event) => {
		showSubtaskForm.value[itemId] = !showSubtaskForm.value[itemId];
		if (showSubtaskForm.value[itemId]) {
			newSubtaskTitle.value[itemId] = "";
			newSubtaskDescription.value[itemId] = "";
			autoRotate.value = false; // Pause rotation when form is open
		} else {
			// Resume rotation after a delay
			setTimeout(() => {
				if (!showSubtaskForm.value[itemId] && !activeNodeId.value) {
					autoRotate.value = true;
				}
			}, 1000);
		}
		// Prevent the card from closing when toggling the form
		event?.stopPropagation();
	};

	const addSubtask = (itemId: number) => {
		const title = newSubtaskTitle.value[itemId]?.trim();
		const description = newSubtaskDescription.value[itemId]?.trim();

		if (!title) return;

		const item = props.timelineData.find((i) => i.id === itemId);
		if (!item) return;

		if (!item.subtasks) {
			item.subtasks = [];
		}

		const newSubtask: Subtask = {
			id: Date.now() + Math.random(), // Simple unique ID
			title,
			description: description || "",
			status: "pending",
			energy: Math.floor(Math.random() * 40) + 30 // Random energy 30-70
		};

		item.subtasks.push(newSubtask);

		// Reset form
		newSubtaskTitle.value[itemId] = "";
		newSubtaskDescription.value[itemId] = "";
		showSubtaskForm.value[itemId] = false;
	};

	const updateSubtaskStatus = (itemId: number, subtaskId: number, newStatus: Subtask["status"]) => {
		const item = props.timelineData.find((i) => i.id === itemId);
		if (!item?.subtasks) return;

		const subtask = item.subtasks.find((s) => s.id === subtaskId);
		if (subtask) {
			subtask.status = newStatus;
		}
	};

	const deleteSubtask = (itemId: number, subtaskId: number) => {
		const item = props.timelineData.find((i) => i.id === itemId);
		if (!item?.subtasks) return;

		const index = item.subtasks.findIndex((s) => s.id === subtaskId);
		if (index !== -1 && item.subtasks) {
			item.subtasks.splice(index, 1);
		}
	};

	// User assignment methods
	const toggleUserAssignmentModal = (itemId: number) => {
		showUserAssignmentModal.value[itemId] = true;
		newUserAssignment.value[itemId] = ""; // Clear previous selection
		autoRotate.value = false; // Pause rotation when modal is open
	};

	const closeUserAssignmentModal = (itemId: number) => {
		showUserAssignmentModal.value[itemId] = false;
		// Resume rotation after a delay
		setTimeout(() => {
			if (!showUserAssignmentModal.value[itemId] && !activeNodeId.value) {
				autoRotate.value = true;
			}
		}, 1000);
	};

	const assignUserToTask = (itemId: number) => {
		const userId = newUserAssignment.value[itemId]?.trim();

		if (!userId) return;

		// Prevent multiple rapid submissions
		if (newUserAssignment.value[itemId] === "" || isAssigningUser.value[itemId]) {
			return;
		}

		// Set loading state
		isAssigningUser.value[itemId] = true;

		const item = props.timelineData.find((i) => i.id === itemId);
		if (!item) {
			isAssigningUser.value[itemId] = false;
			return;
		}

		// Initialize assignedUsers array if it doesn't exist
		if (!item.assignedUsers) {
			item.assignedUsers = [];
		}

		// More robust duplicate checking - ensure no duplicates exist
		const isAlreadyAssigned = item.assignedUsers.includes(userId);
		if (isAlreadyAssigned) {
			console.warn(`User ${userId} is already assigned to task ${itemId}`);
			isAssigningUser.value[itemId] = false;
			return;
		}

		// Additional safety check - remove any duplicates that might exist
		item.assignedUsers = item.assignedUsers.filter((id) => id !== userId);

		console.log(`Assigning user ${userId} to task ${itemId}. Current assignments:`, item.assignedUsers);

		// Add user to the task
		item.assignedUsers.push(userId);

		// Emit the event
		emit("user-assigned", item.taskId || item.id.toString(), userId);

		// Reset form immediately to prevent double submission
		newUserAssignment.value[itemId] = "";
		showUserAssignmentModal.value[itemId] = false;

		// Clear loading state
		isAssigningUser.value[itemId] = false;

		console.log(`User assigned successfully. New assignments:`, item.assignedUsers);
	};

	const removeUserFromTask = (itemId: number, userId: string) => {
		const item = props.timelineData.find((i) => i.id === itemId);
		if (!item?.assignedUsers) return;

		const index = item.assignedUsers.indexOf(userId);
		if (index !== -1) {
			item.assignedUsers.splice(index, 1);
			emit("user-removed", item.taskId || item.id.toString(), userId);
		}
	};

	const getUserName = (userId: string, availableUsers?: any[]): string => {
		if (!availableUsers) return "Unknown User";
		const user = availableUsers.find((u) => u.id === userId);
		return user ? (user.name || user.username || user.email || "Unknown User") : "Unknown User";
	};

	const getUserInitials = (userId: string, availableUsers?: any[]): string => {
		const name = getUserName(userId, availableUsers);
		if (name === "Unknown User") return "?";
		return name
			.split(" ")
			.map((word) => word.charAt(0).toUpperCase())
			.join("")
			.slice(0, 2);
	};

	// Subtask orbital positioning methods
	const getSubtaskOrbitStyle = () => {
		return {
			transform: "translate(-50%, -50%)",
			animation: "orbit 20s linear infinite"
		};
	};

	const getSubtaskPosition = (index: number, total: number) => {
		const angle = (index / total) * 360;
		const radius = 24; // Distance from parent task
		const radian = (angle * Math.PI) / 180;

		const x = radius * Math.cos(radian);
		const y = radius * Math.sin(radian);

		return {
			transform: `translate(${x}px, ${y}px)`,
			left: "50%",
			top: "50%"
		};
	};

	const toggleSubtaskDetails = (itemId: number, subtaskId: number) => {
		// This could be used to show detailed subtask information
		console.log("Toggle subtask details:", { itemId, subtaskId });
	};

	const getNodeRingIndex = (index: number) => {
		// Calculate which ring this task belongs to (every 10 tasks per ring)
		return Math.floor(index / 10);
	};

	// Auto-rotation watcher
	watch([autoRotate, viewMode], ([newAutoRotate, newViewMode]) => {
		if (rotationTimer) {
			clearInterval(rotationTimer);
			rotationTimer = null;
		}

		if (newAutoRotate && newViewMode === "orbital") {
			rotationTimer = setInterval(() => {
				rotationAngle.value = Number(((rotationAngle.value + 0.3) % 360).toFixed(3));
			}, 50);
		}
	});

	// Lifecycle
	onMounted(() => {
		if (autoRotate.value && viewMode.value === "orbital") {
			rotationTimer = setInterval(() => {
				rotationAngle.value = Number(((rotationAngle.value + 0.3) % 360).toFixed(3));
			}, 50);
		}
	});

	onUnmounted(() => {
		if (rotationTimer) {
			clearInterval(rotationTimer);
		}
	});

	// Methods for image upload
	const triggerCenterImageUpload = () => {
		if (centerImageInput.value) {
			centerImageInput.value.click();
		}
	};

	const handleCenterImageUpload = (event: Event) => {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			const file = target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					if (e.target?.result) {
						centerIconImage.value = e.target.result as string;
						// Generate a random color for the new icon
						centerIconColor.value = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
					}
				};
				reader.readAsDataURL(file);
			}
		}
	};

	// New methods for task icon upload
	const setTaskImageInputRef = (taskId: number, el: any) => {
		if (el && el.tagName === 'INPUT') {
			taskIconInputs.value[taskId] = el as HTMLInputElement;
		}
	};

	const triggerTaskImageUpload = (taskId: number) => {
		if (taskIconInputs.value[taskId]) {
			taskIconInputs.value[taskId]?.click();
		}
	};

	const handleTaskImageUpload = (taskId: number, event: Event) => {
		const target = event.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			const file = target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (e) => {
					if (e.target?.result) {
						taskIconImages.value[taskId] = e.target.result as string;
						// Generate a random color for the new icon
						taskIconColors.value[taskId] = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
					}
				};
				reader.readAsDataURL(file);
			}
		}
	};

	// New methods for task icon customization
	const setTaskIconColor = (taskId: number, color: string) => {
		taskIconColors.value[taskId] = color;
		taskIconImages.value[taskId] = null; // Clear image if color is selected
	};

	const removeTaskIconCustomization = (taskId: number) => {
		taskIconImages.value[taskId] = null;
		delete taskIconColors.value[taskId]; // Remove color instead of setting to null
	};

	const generateRandomTaskColor = (taskId: number) => {
		const randomColor = predefinedColors[Math.floor(Math.random() * predefinedColors.length)];
		if (randomColor) {
			setTaskIconColor(taskId, randomColor);
		}
	};

	// Center Icon Customization Modal State
	const showCenterCustomizationModal = ref<boolean>(false);
	const centerCustomizationTitle = ref<string>("");
	const centerCustomizationIconImage = ref<string | null>(null);
	const centerCustomizationIconColor = ref<string | null>(null);

	const openCenterCustomizationModal = () => {
		showCenterCustomizationModal.value = true;
		centerCustomizationIconImage.value = centerIconImage.value;
		centerCustomizationIconColor.value = centerIconColor.value;
	};

	const closeCenterCustomizationModal = () => {
		showCenterCustomizationModal.value = false;
		// Resume rotation after a delay
		setTimeout(() => {
			if (!showCenterCustomizationModal.value && !activeNodeId.value) {
				autoRotate.value = true;
			}
		}, 1000);
	};

	const setCenterIconColor = (color: string) => {
		centerIconColor.value = color;
		centerIconImage.value = null; // Clear image if color is selected
	};

	const removeCenterIconCustomization = () => {
		centerIconImage.value = null;
		centerIconColor.value = null; // Set to null instead of using delete
	};

	const generateRandomCenterIconColor = () => {
		const randomColor = predefinedColors[Math.floor(Math.random() * predefinedColors.length)];
		if (randomColor) {
			setCenterIconColor(randomColor);
		}
	};

	// Expose methods for parent component
	defineExpose({
		moveTaskToTop
	});
</script>

<style scoped>
/* Additional animations and transitions */
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes ping {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

/* Simple single ring animation */
@keyframes orbit {
	from {
		transform: translate(-50%, -50%) rotate(0deg);
	}
	to {
		transform: translate(-50%, -50%) rotate(360deg);
	}
}

/* Single ring animation */
.ring-1 {
	animation: orbit 20s linear infinite;
	transition: all 0.3s ease-in-out;
}

/* Hover effect for ring */
.ring-1:hover {
	opacity: 0.6 !important;
	border-color: rgba(255, 255, 255, 0.6) !important;
}

/* Subtask orbital animation */
.subtask-orbit-1 {
  animation: orbit 15s linear infinite;
}

.subtask-orbit-2 {
  animation: orbit 12s linear infinite reverse;
}

.subtask-orbit-3 {
  animation: orbit 18s linear infinite;
}

.subtask-orbit-4 {
  animation: orbit 10s linear infinite reverse;
}

.subtask-orbit-5 {
  animation: orbit 22s linear infinite;
}
</style>


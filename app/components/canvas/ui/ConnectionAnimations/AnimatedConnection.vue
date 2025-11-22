<template>
	<!-- Dynamic animation component loader -->
	<ParticleConnection 
		v-if="animationType === 'particle'" 
		v-bind="componentProps"
	/>
	<BeamConnection 
		v-else-if="animationType === 'beam'" 
		v-bind="componentProps"
	/>
	<LightConnection 
		v-else-if="animationType === 'light'" 
		v-bind="componentProps"
	/>
	<LaserConnection 
		v-else-if="animationType === 'laser'" 
		v-bind="componentProps"
	/>
	<PulseConnection 
		v-else-if="animationType === 'pulse'" 
		v-bind="componentProps"
	/>
	<WaveConnection 
		v-else-if="animationType === 'wave'" 
		v-bind="componentProps"
	/>
	<GlowConnection 
		v-else-if="animationType === 'glow'" 
		v-bind="componentProps"
	/>
</template>

<script setup lang="ts">
import ParticleConnection from './ParticleConnection.vue';
import BeamConnection from './BeamConnection.vue';
import LightConnection from './LightConnection.vue';
import LaserConnection from './LaserConnection.vue';
import PulseConnection from './PulseConnection.vue';
import WaveConnection from './WaveConnection.vue';
import GlowConnection from './GlowConnection.vue';

const props = defineProps<{
	animationType: 'particle' | 'beam' | 'light' | 'laser' | 'pulse' | 'wave' | 'glow'
	speed: 'slow' | 'normal' | 'fast'
	color?: string
	edgeId?: string
}>();

// Pass edgeId to all child components
const componentProps = {
	speed: props.speed,
	color: props.color,
	edgeId: props.edgeId
};
</script>

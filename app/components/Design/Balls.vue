<template>
	<div class="absolute inset-0 transition-opacity opacity-10 -z-50   duration-500">
		<div class="absolute top-[10%] left-[15%] w-[30vw] h-[30vw] max-w-500px max-h-500px rounded-full bg-gradient-to-l from-[#141c26] to-primary blur-100px animate-blob" />
		<div class="absolute top-[40%] right-[15%] w-[25vw] h-[25vw] max-w-400px max-h-400px rounded-full bg-gradient-to-b from-[#141c26] to-primary blur-100px animate-blob" />
		<div class="absolute bottom-[10%] left-[35%] w-[20vw] h-[20vw] max-w-300px max-h-300px rounded-full bg-gradient-to-r from-[#141c26] to-primary blur-100px animate-blob" />
	</div>
</template>

<style scoped>
@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes fade-in {
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
}

@keyframes fade-out {
  0% { opacity: 1; transform: translateY(0); }
  100% { opacity: 0; transform: translateY(20px); }
}

/* Custom animations */
.animate-blob {
  animation: blob 20s infinite;
}

.animation-delay-2000 {
  animation-delay: 1s;
}

.animation-delay-4000 {
  animation-delay: 1s;
}

.animate-pulse-slow {
  animation: pulse 3s infinite;
}

.animate-fade-in {
  animation: fade-in 0.3s forwards;
}

.animate-fade-out {
  animation: fade-out 0.3s forwards;
}

/* Grid pattern background */
.bg-grid-pattern {
  background-image: linear-gradient(to right, rgba(224, 166, 6, 0.1) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(100, 100, 100, 0.1) 1px, transparent 1px);
}
</style>

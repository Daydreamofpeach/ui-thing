<template>
  <div class="flex items-center justify-center">
    <form>
      <UiCard
        class="w-[360px] max-w-sm"
        title="buildit"
        description="Enter your email and password to get started."
      >
        <template #content>
          <UiCardContent>
            <div class="grid w-full items-center gap-4">
              <UiVeeInput name="email" label="Email" type="email" required />
              <UiVeeInput name="password" label="Password" type="password" required />
              <div class="flex items-center justify-between pt-2 text-sm">
                <UiVeeCheckbox class="gap-1.5" label="Remember me" />
                <NuxtLink class="text-primary underline-offset-2 hover:underline" to="#"
                  >Forgot password?</NuxtLink
                >
              </div>
            </div>
          </UiCardContent>
        </template>
        <template #footer>
          <UiCardFooter class="flex-col gap-4">
            <UiButton class="w-full" effect="ringHover" type="submit">Sign In</UiButton>
            <UiDivider><span class="text-sm text-muted-foreground">or</span></UiDivider>
            <UiButton variant="outline" class="w-full">
              <Icon name="logos:google-icon" />
              <span>Continue with Google</span>
            </UiButton>
          </UiCardFooter>
        </template>
      </UiCard>
    </form>
  </div>
</template>

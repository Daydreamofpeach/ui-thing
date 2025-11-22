<template>
  <ExampleShowcase :examples="examples" />
</template>

<script lang="ts" setup>
// Import the ExampleShowcase component
import ExampleShowcase from './ExampleShowcase.vue';

// Import all card example components
import ReportIssue from '~/components/Examples/Card/ReportIssue.vue';
import ShareDocument from '~/components/Examples/Card/ShareDocument.vue';
import TeamMembers from '~/components/Examples/Card/TeamMembers.vue';
import GithubCard from '~/components/Examples/Card/GithubCard.vue';
import Notifications from '~/components/Examples/Card/Notifications.vue';
import PaymentMethod from '~/components/Examples/Card/PaymentMethod.vue';
import PickDate from '~/components/Examples/Card/PickDate.vue';
import CookieSettings from '~/components/Examples/Card/CookieSettings.vue';
import CreateAnAccount from '~/components/Examples/Card/CreateAnAccount.vue';

// Define all card examples
const examples = [
  {
    title: 'Report Issue',
    component: ReportIssue,
    iframeHeight: '400px'
  },
  {
    title: 'Share Document',
    component: ShareDocument,
    iframeHeight: '400px'
  },
  {
    title: 'Team Members',
    component: TeamMembers,
    iframeHeight: '500px'
  },
  {
    title: 'GitHub Card',
    component: GithubCard,
    iframeHeight: '300px'
  },
  {
    title: 'Notifications',
    component: Notifications,
    iframeHeight: '300px'
  },
  {
    title: 'Payment Method',
    component: PaymentMethod,
    iframeHeight: '500px'
  },
  {
    title: 'Pick Date',
    component: PickDate,
    iframeHeight: '300px'
  },
  {
    title: 'Cookie Settings',
    component: CookieSettings,
    iframeHeight: '400px'
  },
  {
    title: 'Create An Account',
    component: CreateAnAccount,
    iframeHeight: '500px'
  }
];
</script>

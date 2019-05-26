import pulsar from '@/services/pulsar-api'

export default (ctx, inject) => {
  const pulsarApiWithAxios = pulsar(ctx.$axios)
  inject('pulsar', pulsarApiWithAxios)
}

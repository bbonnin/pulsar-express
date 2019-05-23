import pulsar from '@/services/pulsar-api'

export default (ctx, inject) => {
  const apiWithAxios = pulsar(ctx.$axios)
  inject('pulsar', apiWithAxios)
}

docker_registry_org="kafkaesqueio"


version="0.5.1_k1"


docker tag pulsar-express:latest ${docker_registry_org}/pulsar-express:$version

# Push all images and tags
docker push ${docker_registry_org}/pulsar-express:$version


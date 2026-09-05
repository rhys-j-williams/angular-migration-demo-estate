# Port allocation

Fixed for the whole estate. Every application resolves these through its `env.json` or environment
file, so no code change is needed to run locally.

## Registry and identity

| Port | Service |
|---|---|
| 4873 | Verdaccio, standing in for the internal Artifactory |
| 4400 | keystone-idp-mock |

## Platform services

| Port | Service |
|---|---|
| 4500 | bff-retail |
| 4501 | bff-business |
| 4510 | beacon-notifications |
| 4511 | alerts-preferences-service |
| 4512 | txn-posting-service |
| 4513 | pii-vault-service |
| 4514 | audit-trail-service |
| 4515 | entitlements-service |
| 4516 | bedrock-adapter |
| 4517 | iris-orchestrator |
| 4518 | documents-service |
| 4519 | statements-api |
| 4520 | exposure-calc |

## External system mocks

| Port | Service |
|---|---|
| 4600 | bedrock-core-mock |
| 4601 | aggregio-mock |
| 4602 | tickerhaus-mock |
| 4603 | triscore-mock |
| 4604 | paylink-network-mock |
| 4605 | vault-mock |
| 4606 | splunk-hec-mock |
| 4607 | lantern-collector-mock |
| 4608 | semaphore-flags-mock |
| 4609 | ldap-mock |

## Front ends

| Port | Application |
|---|---|
| 4200 | retail-web |
| 4201 | business-web |
| 4202 | keystone-web |
| 4203 | ledgerline-web |
| 4204 | canopy-showcase |
| 4205 | iris-widget |

## Infrastructure

| Port | Service |
|---|---|
| 9092 | Redpanda, standing in for Kafka |
| 6379 | Redis |
| 1414 | IBM MQ, console on 9443 |
| 61616 | ActiveMQ Artemis, the no-Docker fallback for MQ |

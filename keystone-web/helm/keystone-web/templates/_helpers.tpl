{{- define "keystone-web.name" -}}
{{- .Chart.Name -}}
{{- end -}}

{{- define "keystone-web.labels" -}}
app.kubernetes.io/name: {{ include "keystone-web.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .Values.image.tag | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
meridian.bank/team: identity-platform
{{- end -}}

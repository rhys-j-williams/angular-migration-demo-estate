{{- define "iris-widget.name" -}}
{{- .Chart.Name -}}
{{- end -}}
{{- define "iris-widget.labels" -}}
app.kubernetes.io/name: {{ include "iris-widget.name" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/part-of: meridian-online
meridian.internal/team: retail-digital
{{- end -}}

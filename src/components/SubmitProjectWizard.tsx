import { useEffect, useRef, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { apiService } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { MapPin, Camera, Upload, Loader2, CheckCircle, AlertTriangle, Trash2, Target } from 'lucide-react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

interface LocationData { latitude: number; longitude: number; accuracy: number }

type EvidenceType = 'before' | 'during' | 'current'

interface EvidenceImage { id: string; file: File; preview: string; type: EvidenceType; timestamp: Date }

const ECOSYSTEMS = [
  { value: 'mangrove', label: 'Mangrove' },
  { value: 'seagrass', label: 'Seagrass' },
  { value: 'saltmarsh', label: 'Salt Marsh' }
]

const METHODOLOGIES = [
  'VM0033 - Methodology for Tidal Wetland and Seagrass Restoration',
  'VM0024 - Methodology for Coastal Wetland Creation'
]

export function SubmitProjectWizard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const steps = ['Basic', 'Location', 'Evidence', 'Methodology', 'Review']

  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [ecosystem, setEcosystem] = useState('')
  const [area, setArea] = useState<number>(0)
  const [location, setLocation] = useState('')
  const [coords, setCoords] = useState<LocationData | null>(null)
  const [methodology, setMethodology] = useState('')
  const [timeline, setTimeline] = useState<number>(12)
  const [expectedCredits, setExpectedCredits] = useState<number>(0)

  // Evidence
  const [evidence, setEvidence] = useState<EvidenceImage[]>([])
  const [selectedType, setSelectedType] = useState<EvidenceType>('current')
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [deviceId, setDeviceId] = useState<string | undefined>(undefined)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraStarting, setCameraStarting] = useState(false)
  const [cameraMsg, setCameraMsg] = useState<string | null>(null)

  // UX state
  const [errors, setErrors] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [success, setSuccess] = useState(false)

  const ecoMap: Record<string, string> = { mangrove: 'MANGROVE', seagrass: 'SEAGRASS', saltmarsh: 'SALT_MARSH' }

  const calcCredits = (a: number, eco: string) => {
    const rate = eco === 'mangrove' ? 3.5 : eco === 'seagrass' ? 1.9 : eco === 'saltmarsh' ? 2.8 : 2
    return Math.round((a || 0) * rate)
  }

  useEffect(() => { setExpectedCredits(calcCredits(area, ecosystem)) }, [area, ecosystem])

  const getLocation = async () => {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
      )
      const l = { latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy }
      setCoords(l)
      setLocation(`${l.latitude.toFixed(6)}, ${l.longitude.toFixed(6)}`)
      try { localStorage.setItem('submit-coords', JSON.stringify(l)) } catch {}
    } catch (e) {
      setErrors(prev => [...prev, 'Unable to fetch geolocation. You can enter location manually.'])
    }
  }

  const refreshDevices = async () => {
    try {
      const all = await navigator.mediaDevices.enumerateDevices()
      setDevices(all.filter(d => d.kind === 'videoinput'))
    } catch {}
  }

  const startCamera = async () => {
    setCameraStarting(true)
    setCameraMsg('Initializing camera…')
    try {
      let stream: MediaStream | null = null
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: deviceId ? { deviceId: { exact: deviceId } } : {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        })
      } catch (primaryErr) {
        // Fallback to any available video device
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        } catch (fallbackErr) {
          throw fallbackErr
        }
      }
      if (videoRef.current && stream) {
        const v = videoRef.current
        v.srcObject = stream
        v.muted = true
        v.playsInline = true as any
        setCameraMsg('Starting preview…')
        try { await v.play() } catch {}
        setCameraActive(true)
        setCameraMsg(null)
        await refreshDevices()
      }
    } catch (e: any) {
      console.error('getUserMedia error:', e)
      const msg = e?.message || 'Camera access denied or unavailable. Use file upload instead.'
      setErrors(prev => [...prev, msg])
      setCameraMsg(msg)
    } finally {
      setCameraStarting(false)
    }
  }
  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const s = videoRef.current.srcObject as MediaStream
      s.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setCameraActive(false)
  }
  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return
    const v = videoRef.current
    const c = canvasRef.current
    const ctx = c.getContext('2d')
    if (!ctx) return
    c.width = v.videoWidth
    c.height = v.videoHeight
    ctx.drawImage(v, 0, 0)
    c.toBlob(b => {
      if (!b) return
      const file = new File([b], `evidence-${selectedType}-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const item: EvidenceImage = { id: Math.random().toString(36).slice(2), file, preview: c.toDataURL('image/jpeg', 0.8), type: selectedType, timestamp: new Date() }
      setEvidence(prev => {
        const next = [...prev, item]
        try { localStorage.setItem('submit-evidence', JSON.stringify(next.map(i => ({ id: i.id, preview: i.preview, type: i.type, timestamp: i.timestamp })))) } catch {}
        return next
      })
    }, 'image/jpeg', 0.85)
  }

  const onFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    files.forEach(f => {
      if (!f.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = () => {
        setEvidence(prev => {
          const next = [...prev, { id: Math.random().toString(36).slice(2), file: f, preview: String(reader.result), type: selectedType, timestamp: new Date() }]
          try { localStorage.setItem('submit-evidence', JSON.stringify(next.map(i => ({ id: i.id, preview: i.preview, type: i.type, timestamp: i.timestamp })))) } catch {}
          return next
        })
      }
      reader.readAsDataURL(f)
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const validateStep = (): boolean => {
    const errs: string[] = []
    if (step === 0) {
      if (!name.trim()) errs.push('Project name is required')
      if (!description.trim()) errs.push('Project description is required')
      if (!ecosystem) errs.push('Select an ecosystem')
      if (area <= 0) errs.push('Area must be greater than 0')
    } else if (step === 1) {
      if (!location.trim()) errs.push('Location/address is required')
      if (!coords) errs.push('Please capture your GPS location (Use Current Location)')
    } else if (step === 2) {
      if (evidence.length === 0) errs.push('Add at least one evidence image')
    } else if (step === 3) {
      if (!methodology) errs.push('Select a methodology')
      if (timeline < 6) errs.push('Timeline must be at least 6 months')
    }
    setErrors(errs)
    return errs.length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    // Validate all steps before submit
    for (let s = 0; s <= 3; s++) { setStep(s); if (!validateStep()) return }

    setLoading(true)
    setProgress(10)
    try {
      const fd = new FormData()
      fd.append('title', name)
      fd.append('description', description)
      fd.append('ecosystem', ecoMap[ecosystem] || ecosystem.toUpperCase())
      fd.append('location', location)
      if (coords) { fd.append('latitude', String(coords.latitude)); fd.append('longitude', String(coords.longitude)) }
      fd.append('area', String(area))
      fd.append('carbonCreditsEstimated', String(expectedCredits))
      fd.append('timeline', `${timeline} months`)
      fd.append('methodology', methodology)
      if (user) { fd.append('submitterId', user.id); fd.append('submitterName', user.name); if (user.organization) fd.append('submitterOrganization', user.organization) }
      evidence.forEach(img => fd.append('files', img.file))

      setProgress(60)
      await apiService.submitProject(fd)
      setProgress(100)
      setSuccess(true)
      setErrors([])
      // clear persisted evidence and coords
      localStorage.removeItem('submit-evidence')
      localStorage.removeItem('submit-coords')
      toast.success('Project submitted successfully! Redirecting to My Projects…')
      setTimeout(() => navigate('/projects'), 800)
    } catch (err) {
      setErrors(['Failed to submit project. Please try again.'])
    } finally { setLoading(false) }
  }

  useEffect(() => { refreshDevices(); return () => stopCamera() }, [])

  if (!user || user.role !== 'NGO') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Only NGO users can submit projects.</AlertDescription>
        </Alert>
      </div>
    )
  }

  // Restore persisted evidence/coords once on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('submit-evidence')
      if (saved) {
        const parsed: Array<{ id: string; preview: string; type: EvidenceType; timestamp: string }> = JSON.parse(saved)
        setEvidence(parsed.map(p => ({ id: p.id, file: new File([], `persisted-${p.id}.jpg`), preview: p.preview, type: p.type, timestamp: new Date(p.timestamp) })))
      }
      const sc = localStorage.getItem('submit-coords')
      if (sc) setCoords(JSON.parse(sc))
    } catch {}
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Submit New Project</h1>
          <p className="text-gray-600">Step {step + 1} of {steps.length}: {steps[step]}</p>
        </div>

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">Project submitted successfully!</AlertDescription>
          </Alert>
        )}

        {errors.length > 0 && (
          <Alert className="mb-4 border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription>
              <ul className="list-disc list-inside text-red-800">
                {errors.map((er, i) => <li key={i}>{er}</li>)}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {loading && (
          <Card className="mb-4"><CardContent className="pt-6">
            <div className="flex items-center gap-2 mb-2"><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</div>
            <Progress value={progress} className="h-2" />
          </CardContent></Card>
        )}

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-4">
          {steps.map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div className={`h-8 px-3 rounded-full text-sm flex items-center justify-center ${i === step ? 'bg-blue-600 text-white' : i < step ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-800'}`}>{s}</div>
              {i < steps.length - 1 && <div className={`h-1 flex-1 ${i < step ? 'bg-green-600' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-6">
          {step === 0 && (
            <Card><CardHeader><CardTitle>Basic Info</CardTitle><CardDescription>Describe your project</CardDescription></CardHeader><CardContent className="space-y-4">
              <div>
                <Label>Project Name *</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Sundarbans Mangrove Restoration" />
              </div>
              <div>
                <Label>Description *</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Ecosystem *</Label>
                  <Select value={ecosystem} onValueChange={setEcosystem}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {ECOSYSTEMS.map(e => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Area (hectares) *</Label>
                  <Input type="number" min="0" step="0.1" value={area} onChange={(e) => setArea(parseFloat(e.target.value) || 0)} />
                </div>
              </div>
              <div className="text-sm text-gray-600">Estimated credits: <strong>{expectedCredits}</strong></div>
            </CardContent></Card>
          )}

          {step === 1 && (
            <Card><CardHeader><CardTitle>Location</CardTitle><CardDescription>Capture GPS and address</CardDescription></CardHeader><CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Button type="button" onClick={getLocation}><MapPin className="h-4 w-4 mr-2" /> Use Current Location</Button>
                {coords && <Badge variant="secondary">{coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)} (±{Math.round(coords.accuracy)}m)</Badge>}
              </div>
              {coords && (
                <div className="rounded overflow-hidden border">
                  <iframe
                    title="map"
                    className="w-full h-56"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.longitude-0.01}%2C${coords.latitude-0.01}%2C${coords.longitude+0.01}%2C${coords.latitude+0.01}&layer=mapnik&marker=${coords.latitude}%2C${coords.longitude}`}
                  />
                </div>
              )}
              <div>
                <Label>Address/Description *</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Village/Area, District, State" />
              </div>
            </CardContent></Card>
          )}

          {step === 2 && (
            <Card><CardHeader><CardTitle>Evidence</CardTitle><CardDescription>Capture photos or upload</CardDescription></CardHeader><CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Button type="button" onClick={cameraActive ? stopCamera : startCamera} disabled={cameraStarting}>
                  {cameraStarting ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Starting…</>) : (cameraActive ? 'Stop Camera' : 'Start Camera')}
                </Button>
                <Select value={deviceId || ''} onValueChange={(v) => { setDeviceId(v); if (cameraActive) { stopCamera(); startCamera(); } }}>
                  <SelectTrigger className="w-52"><SelectValue placeholder="Select Camera" /></SelectTrigger>
                  <SelectContent>
                    {devices.map(d => <SelectItem key={d.deviceId} value={d.deviceId}>{d.label || `Camera ${d.deviceId.slice(0,6)}`}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={(v) => setSelectedType(v as EvidenceType)}>
                  <SelectTrigger className="w-40"><SelectValue placeholder="Type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">Before</SelectItem>
                    <SelectItem value="during">During</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                  </SelectContent>
                </Select>
                {cameraActive && (
                  <Button type="button" onClick={capture}>
                    <Camera className="h-4 w-4 mr-2" /> Capture Photo
                  </Button>
                )}
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}><Upload className="h-4 w-4 mr-2" />Upload</Button>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles} />
              </div>
              {cameraMsg && (
                <div className="text-xs text-gray-600">{cameraMsg}</div>
              )}
              {cameraActive && (
                <div className="border rounded p-2">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full max-h-80 bg-black rounded"
                  />
                  <div className="mt-2 flex justify-end">
                    <Button type="button" onClick={capture}>
                      <Camera className="h-4 w-4 mr-2" /> Capture Photo
                    </Button>
                  </div>
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
              {evidence.length > 0 && (
                <div className="grid md:grid-cols-3 gap-3">
                  {evidence.map(img => (
                    <div key={img.id} className="border rounded p-2">
                      <img src={img.preview} className="w-full h-40 object-cover rounded" />
                      <div className="flex justify-between items-center text-xs text-gray-600 mt-1">
                        <span>{img.type} · {img.timestamp.toLocaleString()}</span>
                        <Button size="sm" variant="ghost" onClick={() => setEvidence(prev => prev.filter(e => e.id !== img.id))}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent></Card>
          )}

          {step === 3 && (
            <Card><CardHeader><CardTitle>Methodology & Notes</CardTitle></CardHeader><CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Methodology *</Label>
                  <Select value={methodology} onValueChange={setMethodology}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {METHODOLOGIES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Timeline (months) *</Label>
                  <Input type="number" min={6} value={timeline} onChange={(e) => setTimeline(parseInt(e.target.value) || 12)} />
                </div>
              </div>
              <div className="text-sm text-gray-600">Expected credits: <strong>{expectedCredits}</strong></div>
            </CardContent></Card>
          )}

          {step === 4 && (
            <Card><CardHeader><CardTitle>Review & Submit</CardTitle></CardHeader><CardContent className="space-y-2 text-sm">
              <div><strong>Name:</strong> {name}</div>
              <div><strong>Description:</strong> {description}</div>
              <div><strong>Ecosystem:</strong> {ecosystem}</div>
              <div><strong>Area:</strong> {area} hectares</div>
              <div><strong>Location:</strong> {location}</div>
              {coords && <div><strong>Coordinates:</strong> {coords.latitude}, {coords.longitude}</div>}
              <div><strong>Methodology:</strong> {methodology}</div>
              <div><strong>Timeline:</strong> {timeline} months</div>
              <div><strong>Evidence images:</strong> {evidence.length}</div>
            </CardContent></Card>
          )}

          <div className="flex justify-between">
            <Button type="button" variant="outline" disabled={step === 0} onClick={() => { setErrors([]); setStep(s => Math.max(0, s - 1)) }}>Back</Button>
            {step < steps.length - 1 ? (
              <Button type="button" onClick={() => { if (validateStep()) setStep(s => Math.min(steps.length - 1, s + 1)) }}>Next</Button>
            ) : (
              <Button type="submit" disabled={loading}>Submit Project</Button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
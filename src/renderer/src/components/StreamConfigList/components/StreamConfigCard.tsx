import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/shadcn/ui/card'

import { Badge } from '@/shadcn/ui/badge'

import Progress from '@/components/StreamConfigList/components/Progress'

import OperationBar from '@/components/StreamConfigList/components/OperationBar'

export default function StreamConfigCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center relative">
          <div className="flex gap-2">
            <h1>Card Title</h1>
            <Badge variant="outline">Badge</Badge>
          </div>
          <OperationBar />
        </CardTitle>
        <CardDescription>Card Description: https:www/xmind.app</CardDescription>
      </CardHeader>
      <CardContent>
        <Progress />
      </CardContent>
    </Card>
  )
}

<#
.SYNOPSIS
    Libera as portas do dev server e mata instancias headless/automacao do Edge.

.DESCRIPTION
    - Encerra o processo que estiver escutando nas portas informadas (dev server, HMR, etc).
    - Encerra SOMENTE os processos msedge.exe iniciados com --headless ou
      --remote-debugging-port (usados por screenshot/automacao).

    NAO toca na sua janela normal do Edge. O Edge e multiprocesso: cada aba e um
    processo filho com MainWindowHandle = 0, entao filtrar por "sem janela"
    derrubava a sessao inteira. Aqui filtramos pela linha de comando.

.PARAMETER Ports
    Portas a liberar. Padrao: 4126, 4127, 4128, 4129.

.EXAMPLE
    pwsh ./scripts/clean-ports.ps1
    pwsh ./scripts/clean-ports.ps1 -Ports 3000,3001
#>
param(
    [int[]] $Ports = @(4126, 4127, 4128, 4129)
)

# 1. Libera as portas do dev server
Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
    Where-Object { $_.LocalPort -in $Ports } |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object {
        $proc = Get-Process -Id $_ -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Output "matando PID $($proc.Id) ($($proc.ProcessName)) na porta"
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
    }

# 2. Mata apenas Edge headless / de automacao (preserva sua sessao normal)
Get-CimInstance Win32_Process -Filter "Name = 'msedge.exe'" -ErrorAction SilentlyContinue |
    Where-Object { $_.CommandLine -match '--headless' -or $_.CommandLine -match '--remote-debugging-port' } |
    ForEach-Object {
        Write-Output "matando Edge headless PID $($_.ProcessId)"
        Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    }

Write-Output "cleaned"

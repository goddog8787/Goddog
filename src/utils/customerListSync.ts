export interface CustomerListVersion {
  updatedAtMs?: number;
  explicitClear?: boolean;
}

export function chooseCustomerListSource(
  localCount: number, local: CustomerListVersion,
  cloudCount: number, cloud: CustomerListVersion,
): 'local' | 'cloud' {
  if (localCount === 0 && !local.explicitClear) return 'cloud';
  if (cloudCount === 0 && !cloud.explicitClear) return 'local';
  const localTime = local.updatedAtMs ?? 0;
  const cloudTime = cloud.updatedAtMs ?? 0;
  if (cloudTime === localTime && localCount !== cloudCount && local.explicitClear !== cloud.explicitClear) {
    return cloud.explicitClear ? 'cloud' : 'local';
  }
  return localTime >= cloudTime ? 'local' : 'cloud';
}

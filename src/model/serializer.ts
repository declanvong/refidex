import { checkExists, checkState } from 'base/preconditions';
import { RefidexNode, Status } from 'model/model';

export class Serializer {
  static deserializeModel(input: any) {
    const { domains, nodes } = input;
    return {
      domains: this.deserializeDomains(checkExists(domains)),
      nodes: this.deserializeNodes(checkExists(nodes)),
    }
  }

  static deserializeDomains(domains: any) {
    // TODO: domains
    return [];
  }

  static deserializeNodes(nodes: any) {
    checkState(Array.isArray(nodes));
    return nodes.map(n => this.deserializeNode(n));
  }

  static deserializeNode(node: any): RefidexNode {
    const {
      id,
      title,
      details,
      icon,
      dependencies,
      parentDomain,
      status,
      progress,
    } = node;
    return {
      id: checkIsString(id),
      title: checkIsString(title),
      details: isEmptyOr(details, checkIsString),
      icon: isEmptyOr(icon, checkIsString),
      dependencies: isEmptyOr(dependencies, checkIsStringArray),
      parentDomain: isEmptyOr(parentDomain, checkIsString),
      status: this.deserializeStatus(status),
      progress: isEmptyOr(progress, checkIsNumber),
    }
  }

  static deserializeStatus(status: any): Status {
    checkIsNumber(status);
    switch (status) {
      case Status.PLANNED:
      case Status.SOON:
      case Status.IN_PROGRESS:
      case Status.DONE:
        return status;
      default:
        throw new Error(`expected status to be between ${Status.PLANNED} and ${Status.DONE} but received ${status} instead`);
    }
  }
}

function isEmptyOr<T>(input: any, f: (input: any) => T): T | undefined {
  if (input == null) {
    return;
  }
  return f(input);
}

function checkIsString(s: any): string {
  if (typeof s !== 'string') {
    throw new Error(`expected ${s} to be string but found ${typeof s} instead`);
  }
  return s;
}

function checkIsStringArray(sa: any): string[] {
  checkState(Array.isArray(sa));
  return sa.map(s => checkIsString(s));
}

function checkIsNumber(n: any): number {
  if (typeof n !== 'number') {
    throw new Error(`expected ${n} to be number but found ${typeof n} instead`);
  }
  return n;
}

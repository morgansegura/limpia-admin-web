import { useState, useCallback } from 'react';
import { salesApi } from '@/lib/api';

export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  data?: unknown;
  error?: string;
}

export interface EstimateWorkflow {
  estimateId: string;
  customerId: string;
  customerName: string;
  steps: WorkflowStep[];
  currentStep: number;
  isActive: boolean;
}

const WORKFLOW_STEPS: Omit<WorkflowStep, 'status' | 'data' | 'error'>[] = [
  { id: 'estimate_accepted', name: 'Estimate Accepted' },
  { id: 'contract_signing', name: 'Contract Signing' },
  { id: 'payment_processing', name: 'Payment Processing' },
  { id: 'service_scheduling', name: 'Service Scheduling' },
  { id: 'crew_assignment', name: 'Crew Assignment' },
  { id: 'customer_notifications', name: 'Customer Notifications' },
  { id: 'service_preparation', name: 'Service Preparation' },
];

export const useWorkflow = () => {
  const [workflows, setWorkflows] = useState<EstimateWorkflow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeWorkflow = useCallback(async (
    estimateId: string,
    customerId: string,
    customerName: string
  ) => {
    const newWorkflow: EstimateWorkflow = {
      estimateId,
      customerId,
      customerName,
      steps: WORKFLOW_STEPS.map(step => ({
        ...step,
        status: 'pending' as const,
      })),
      currentStep: 0,
      isActive: true,
    };

    setWorkflows(prev => [...prev.filter(w => w.estimateId !== estimateId), newWorkflow]);
    return newWorkflow;
  }, []);

  const updateWorkflowStep = useCallback((
    estimateId: string,
    stepId: string,
    status: WorkflowStep['status'],
    data?: unknown,
    error?: string
  ) => {
    setWorkflows(prev => prev.map(workflow => {
      if (workflow.estimateId !== estimateId) return workflow;

      const updatedSteps = workflow.steps.map(step => {
        if (step.id !== stepId) return step;
        return { ...step, status, data, error };
      });

      // Update current step index
      const currentStepIndex = updatedSteps.findIndex(step => 
        step.status === 'in_progress' || step.status === 'pending'
      );

      return {
        ...workflow,
        steps: updatedSteps,
        currentStep: currentStepIndex >= 0 ? currentStepIndex : workflow.steps.length - 1,
      };
    }));
  }, []);

  const executeContractSigning = useCallback(async (
    estimateId: string,
    contractData: unknown
  ) => {
    setLoading(true);
    setError(null);

    try {
      updateWorkflowStep(estimateId, 'contract_signing', 'in_progress');
      
      const result = await salesApi.initiateContract(estimateId, contractData);
      
      updateWorkflowStep(estimateId, 'contract_signing', 'completed', {
        contractId: (result as { contractId: string }).contractId,
        signatureUrl: (result as { signatureUrl: string }).signatureUrl,
      });

      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Contract signing failed';
      updateWorkflowStep(estimateId, 'contract_signing', 'failed', null, errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateWorkflowStep]);

  const executePaymentProcessing = useCallback(async (
    estimateId: string,
    paymentData: unknown
  ) => {
    setLoading(true);
    setError(null);

    try {
      updateWorkflowStep(estimateId, 'payment_processing', 'in_progress');
      
      const result = await salesApi.processPayment(estimateId, paymentData);
      
      updateWorkflowStep(estimateId, 'payment_processing', 'completed', {
        paymentId: (result as { paymentId: string }).paymentId,
        transactionId: (result as { transactionId: string }).transactionId,
        amount: (result as { amount: number }).amount,
      });

      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Payment processing failed';
      updateWorkflowStep(estimateId, 'payment_processing', 'failed', null, errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateWorkflowStep]);

  const executeServiceScheduling = useCallback(async (
    estimateId: string,
    scheduleData: unknown
  ) => {
    setLoading(true);
    setError(null);

    try {
      updateWorkflowStep(estimateId, 'service_scheduling', 'in_progress');
      
      const result = await salesApi.scheduleService(estimateId, scheduleData);
      
      updateWorkflowStep(estimateId, 'service_scheduling', 'completed', {
        scheduledDate: (result as { scheduledDate: string }).scheduledDate,
        timeSlot: (result as { timeSlot: string }).timeSlot,
        crewId: (result as { crewId: string }).crewId,
      });

      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Service scheduling failed';
      updateWorkflowStep(estimateId, 'service_scheduling', 'failed', null, errorMessage);
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateWorkflowStep]);

  const sendCustomerNotifications = useCallback(async (
    customerId: string,
    notificationType: string,
    data: unknown
  ) => {
    setLoading(true);
    setError(null);

    try {
      const result = await salesApi.sendCustomerNotification(customerId, notificationType, data);
      return result;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Notification sending failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWorkflow = useCallback((estimateId: string) => {
    return workflows.find(w => w.estimateId === estimateId);
  }, [workflows]);

  const getAvailableSlots = useCallback(async (date: string, serviceType: string) => {
    setLoading(true);
    setError(null);

    try {
      const slots = await salesApi.getAvailableSlots(date, serviceType);
      return slots;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch available slots';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    workflows,
    loading,
    error,
    initializeWorkflow,
    updateWorkflowStep,
    executeContractSigning,
    executePaymentProcessing,
    executeServiceScheduling,
    sendCustomerNotifications,
    getWorkflow,
    getAvailableSlots,
  };
};